package com.soniya.service;

import com.soniya.entity.Approval;
import com.soniya.entity.Negotiation;
import com.soniya.repository.ApprovalRepository;
import com.soniya.repository.NegotiationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final NegotiationRepository negotiationRepository;

    public ApprovalService(
            ApprovalRepository approvalRepository,
            NegotiationRepository negotiationRepository) {

        this.approvalRepository = approvalRepository;
        this.negotiationRepository = negotiationRepository;
    }

    // =====================================================
    // CREATE APPROVAL REQUEST
    // =====================================================

    @Transactional
    public Approval createApproval(
            Long customerId,
            Long negotiationId) {

        Negotiation negotiation =
                negotiationRepository.findById(negotiationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Negotiation not found"
                                ));

        // Ownership check
        if (!negotiation.getCustomerId().equals(customerId)) {
            throw new RuntimeException(
                    "You cannot access this negotiation"
            );
        }

        // Negotiation must be accepted
        if (!"ACCEPTED".equalsIgnoreCase(
                negotiation.getStatus())) {

            throw new RuntimeException(
                    "Negotiation is not accepted"
            );
        }

        // Prevent duplicate approval
        if (approvalRepository
                .findByNegotiationId(negotiationId)
                .isPresent()) {

            throw new RuntimeException(
                    "Approval already exists"
            );
        }

        Approval approval = new Approval();

        approval.setNegotiationId(negotiationId);
        approval.setOrderId(negotiation.getOrderId());
        approval.setCustomerId(customerId);

        // USER approval required
        approval.setStatus("PENDING");

        approval.setReason(
                "Customer approval required before payment"
        );

        approval.setCreatedAt(
                LocalDateTime.now()
        );

        approval.setUpdatedAt(
                LocalDateTime.now()
        );

        return approvalRepository.save(approval);
    }

    // =====================================================
    // USER APPROVE
    // =====================================================

    @Transactional
    public Approval approve(
            Long customerId,
            Long approvalId) {

        Approval approval =
                approvalRepository.findById(approvalId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Approval not found"
                                ));

        if (!approval.getCustomerId().equals(customerId)) {
            throw new RuntimeException(
                    "You cannot approve this request"
            );
        }

        if (!"PENDING".equalsIgnoreCase(
                approval.getStatus())) {

            throw new RuntimeException(
                    "Approval is already processed"
            );
        }

        approval.setStatus("APPROVED");

        approval.setReason(
                "Customer approved payment"
        );

        approval.setUpdatedAt(
                LocalDateTime.now()
        );

        return approvalRepository.save(approval);
    }

    // =====================================================
    // GET APPROVAL
    // =====================================================

    public Approval getApproval(
            Long customerId,
            Long approvalId) {

        Approval approval =
                approvalRepository.findById(approvalId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Approval not found"
                                ));

        if (!approval.getCustomerId().equals(customerId)) {
            throw new RuntimeException(
                    "You cannot access this approval"
            );
        }

        return approval;
    }
}