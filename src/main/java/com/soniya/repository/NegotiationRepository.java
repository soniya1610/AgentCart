package com.soniya.repository;

import com.soniya.entity.Negotiation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NegotiationRepository
        extends JpaRepository<Negotiation, Long> {

    Optional<Negotiation> findByOrderId(Long orderId);

    List<Negotiation> findByCustomerId(Long customerId);

    List<Negotiation> findByMerchantId(Long merchantId);
}