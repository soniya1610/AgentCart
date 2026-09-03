package com.soniya.repository;

import com.soniya.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApprovalRepository
        extends JpaRepository<Approval, Long> {

    Optional<Approval> findByNegotiationId(Long negotiationId);

    Optional<Approval> findByOrderId(Long orderId);
}