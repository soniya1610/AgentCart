package com.soniya.controller;

import com.soniya.entity.Payment;
import com.soniya.entity.User;
import com.soniya.repository.UserRepository;
import com.soniya.service.PaymentService;
import com.soniya.dto.PaymentVerificationRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    public PaymentController(
            PaymentService paymentService,
            UserRepository userRepository) {

        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    // =====================================================
    // CREATE PAYMENT
    // =====================================================

    @PostMapping("/order/{orderId}")
    public ResponseEntity<Payment> createPayment(
            @PathVariable Long orderId,
            Authentication authentication) {

        Long customerId = getUserId(authentication);

        return ResponseEntity.ok(
                paymentService.createPayment(
                        customerId,
                        orderId
                )
        );
    }

    // =====================================================
    // GET PAYMENT
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPayment(
            @PathVariable Long id,
            Authentication authentication) {

        Long customerId = getUserId(authentication);

        return ResponseEntity.ok(
                paymentService.getPayment(
                        customerId,
                        id
                )
        );
    }

    // =====================================================
    // GET MY PAYMENTS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Payment>> getMyPayments(
            Authentication authentication) {

        Long customerId = getUserId(authentication);

        return ResponseEntity.ok(
                paymentService.getMyPayments(
                        customerId
                )
        );
    }

    // =====================================================
    // GET USER ID
    // =====================================================

    private Long getUserId(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));

        return user.getId();
    }
 // =====================================================
 // VERIFY PAYMENT
 // =====================================================

 @PostMapping("/verify")
 public ResponseEntity<Payment> verifyPayment(
         @RequestBody PaymentVerificationRequest request,
         Authentication authentication) {

     Long customerId = getUserId(authentication);

     return ResponseEntity.ok(
             paymentService.verifyPayment(
                     customerId,
                     request
             )
     );
 }
}