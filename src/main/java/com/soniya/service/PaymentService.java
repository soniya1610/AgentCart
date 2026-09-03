package com.soniya.service;

import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.soniya.entity.Approval;
import com.soniya.entity.Order;
import com.soniya.entity.Payment;
import com.soniya.repository.ApprovalRepository;
import com.soniya.repository.OrderItemRepository;
import com.soniya.repository.OrderRepository;
import com.soniya.repository.PaymentRepository;
import com.soniya.dto.PaymentVerificationRequest;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ApprovalRepository approvalRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Value("rzp_test_TWdAiNBNQ4fNAQ")
    private String razorpayKeyId;

    @Value("vxUuD7QzCI2iutGmph2CQ2py")
    private String razorpayKeySecret;

    public PaymentService(
            PaymentRepository paymentRepository,
            ApprovalRepository approvalRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository) {

        this.paymentRepository = paymentRepository;
        this.approvalRepository = approvalRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    // =====================================================
    // CREATE RAZORPAY PAYMENT ORDER
    // =====================================================

    @Transactional
    public Payment createPayment(
            Long customerId,
            Long orderId) {

        // 1. Verify order
           Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));

        // 2. Verify order ownership
        if (!order.getUserId().equals(customerId)) {
            throw new RuntimeException(
                    "You cannot make payment for this order"
            );
        }

        // 3. Verify approval
        Approval approval = approvalRepository
                .findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Approval not found"
                        ));

        if (!approval.getCustomerId().equals(customerId)) {
            throw new RuntimeException(
                    "You cannot access this approval"
            );
        }

        if (!"APPROVED".equalsIgnoreCase(
                approval.getStatus())) {

            throw new RuntimeException(
                    "Payment requires approved negotiation"
            );
        }

        // 4. Prevent duplicate payment
        if (paymentRepository
                .findByOrderId(orderId)
                .isPresent()) {

            throw new RuntimeException(
                    "Payment already exists for this order"
            );
        }

        // 5. Create Razorpay client
        try {

            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            razorpayKeyId,
                            razorpayKeySecret
                    );

            // Razorpay accepts amount in paise
            long amountInPaise =
                    order.getTotalAmount()
                            .multiply(BigDecimal.valueOf(100))
                            .longValue();

            JSONObject orderRequest = new JSONObject();

            orderRequest.put(
                    "amount",
                    amountInPaise
            );

            orderRequest.put(
                    "currency",
                    "INR"
            );

            orderRequest.put(
                    "receipt",
                    "order_" + orderId
            );

            com.razorpay.Order razorpayOrder =
                    razorpayClient.orders.create(
                            orderRequest
                    );

            // 6. Save payment
            Payment payment = new Payment();

            payment.setOrderId(orderId);
            payment.setCustomerId(customerId);
            payment.setAmount(order.getTotalAmount());

            payment.setStatus("PENDING");

            payment.setRazorpayOrderId(
                    razorpayOrder.get("id")
            );

            payment.setCreatedAt(
                    LocalDateTime.now()
            );

            payment.setUpdatedAt(
                    LocalDateTime.now()
            );

            return paymentRepository.save(payment);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to create Razorpay order: "
                            + e.getMessage()
            );
        }
    }

    // =====================================================
    // GET MY PAYMENT
    // =====================================================

    public Payment getPayment(
            Long customerId,
            Long paymentId) {

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"
                                ));

        if (!payment.getCustomerId().equals(customerId)) {
            throw new RuntimeException(
                    "You cannot access this payment"
            );
        }

        return payment;
    }

    // =====================================================
    // GET MY PAYMENTS
    // =====================================================

    public List<Payment> getMyPayments(
            Long customerId) {

        return paymentRepository
                .findByCustomerId(customerId);
    }
 // =====================================================
 // VERIFY PAYMENT
 // =====================================================

 @Transactional
 public Payment verifyPayment(
         Long customerId,
         com.soniya.dto.PaymentVerificationRequest request) {

     Payment payment = paymentRepository
             .findByRazorpayOrderId(
                     request.getRazorpayOrderId()
             )
             .orElseThrow(() ->
                     new RuntimeException(
                             "Payment not found"
                     ));

     // Verify ownership
     if (!payment.getCustomerId().equals(customerId)) {
         throw new RuntimeException(
                 "You cannot verify this payment"
         );
     }

     // Prevent duplicate verification
     if ("SUCCESS".equalsIgnoreCase(payment.getStatus())) {
         return payment;
     }

     try {

    	    JSONObject options = new JSONObject();

    	    options.put(
    	            "razorpay_order_id",
    	            request.getRazorpayOrderId()
    	    );

    	    options.put(
    	            "razorpay_payment_id",
    	            request.getRazorpayPaymentId()
    	    );

    	    options.put(
    	            "razorpay_signature",
    	            request.getRazorpaySignature()
    	    );

    	    boolean verified =
    	            Utils.verifyPaymentSignature(
    	                    options,
    	                    razorpayKeySecret
    	            );

    	    if (verified) {

    	        payment.setStatus("SUCCESS");

    	        payment.setRazorpayPaymentId(
    	                request.getRazorpayPaymentId()
    	        );

    	        payment.setRazorpaySignature(
    	                request.getRazorpaySignature()
    	        );

    	        payment.setFailureReason(null);

    	    } else {

    	        payment.setStatus("FAILED");

    	        payment.setFailureReason(
    	                "Invalid payment signature"
    	        );
    	    }

    	    payment.setUpdatedAt(
    	            LocalDateTime.now()
    	    );

    	    return paymentRepository.save(payment);

    	} catch (Exception e) {

    	    payment.setStatus("FAILED");

    	    payment.setFailureReason(
    	            e.getMessage()
    	    );

    	    payment.setUpdatedAt(
    	            LocalDateTime.now()
    	    );

    	    paymentRepository.save(payment);

    	    throw new RuntimeException(
    	            "Payment verification failed: "
    	                    + e.getMessage()
    	    );
    	}
 }
}