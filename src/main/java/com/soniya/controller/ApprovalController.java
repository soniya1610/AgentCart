package com.soniya.controller;

import com.soniya.entity.Approval;
import com.soniya.entity.User;
import com.soniya.repository.UserRepository;
import com.soniya.service.ApprovalService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

    private final ApprovalService approvalService;
    private final UserRepository userRepository;

    public ApprovalController(
            ApprovalService approvalService,
            UserRepository userRepository) {

        this.approvalService = approvalService;
        this.userRepository = userRepository;
    }

    // =====================================================
    // CREATE APPROVAL
    // =====================================================

    @PostMapping("/negotiation/{negotiationId}")
    public ResponseEntity<Approval> createApproval(
            @PathVariable Long negotiationId,
            Authentication authentication) {

        Long customerId = getUserId(authentication);

        return ResponseEntity.ok(
                approvalService.createApproval(
                        customerId,
                        negotiationId
                )
        );
    }

    // =====================================================
    // APPROVE
    // =====================================================

    @PutMapping("/{id}/approve")
    public ResponseEntity<Approval> approve(
            @PathVariable Long id,
            Authentication authentication) {

        Long customerId = getUserId(authentication);

        return ResponseEntity.ok(
                approvalService.approve(
                        customerId,
                        id
                )
        );
    }

    // =====================================================
    // GET APPROVAL
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Approval> getApproval(
            @PathVariable Long id,
            Authentication authentication) {

        Long customerId = getUserId(authentication);

        return ResponseEntity.ok(
                approvalService.getApproval(
                        customerId,
                        id
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
}