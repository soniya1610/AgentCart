package com.soniya.repository;

import com.soniya.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    List<Payment> findByCustomerId(Long customerId);

    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
}