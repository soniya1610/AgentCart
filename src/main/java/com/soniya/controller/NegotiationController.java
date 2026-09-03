package com.soniya.controller;

import com.soniya.dto.CreateNegotiationRequest;
import com.soniya.dto.NegotiationResponse;
import com.soniya.dto.OfferRequest;
import com.soniya.entity.Negotiation;
import com.soniya.entity.User;
import com.soniya.repository.UserRepository;
import com.soniya.service.NegotiationService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/negotiations")
public class NegotiationController {

    private final NegotiationService negotiationService;
    private final UserRepository userRepository;

    public NegotiationController(
            NegotiationService negotiationService,
            UserRepository userRepository) {

        this.negotiationService = negotiationService;
        this.userRepository = userRepository;
    }


    // =====================================================
    // START NEGOTIATION
    // =====================================================

    @PostMapping
    public ResponseEntity<NegotiationResponse> startNegotiation(
            @RequestBody CreateNegotiationRequest request,
            Authentication authentication) {

        Long customerId =
                getUserId(authentication);

        Negotiation negotiation =
                negotiationService.startNegotiation(
                        customerId,
                        request.getOrderId(),
                        request.getMaxRounds()
                );

        return ResponseEntity.ok(
                NegotiationResponse.fromEntity(
                        negotiation
                )
        );
    }


    // =====================================================
    // GET NEGOTIATION
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<NegotiationResponse> getNegotiation(
            @PathVariable Long id,
            Authentication authentication) {

        Long customerId =
                getUserId(authentication);

        Negotiation negotiation =
                negotiationService.getNegotiation(
                        customerId,
                        id
                );

        return ResponseEntity.ok(
                NegotiationResponse.fromEntity(
                        negotiation
                )
        );
    }


    // =====================================================
    // CUSTOMER MAKE OFFER
    // =====================================================

    @PostMapping("/{id}/offer")
    public ResponseEntity<NegotiationResponse> makeOffer(
            @PathVariable Long id,
            @RequestBody OfferRequest request,
            Authentication authentication) {

        Long customerId =
                getUserId(authentication);

        Negotiation negotiation =
                negotiationService.makeOffer(
                        customerId,
                        id,
                        request.getOffer()
                );

        return ResponseEntity.ok(
                NegotiationResponse.fromEntity(
                        negotiation
                )
        );
    }


    // =====================================================
    // MERCHANT COUNTER OFFER
    // =====================================================

    @PostMapping("/{id}/counter")
    public ResponseEntity<NegotiationResponse> counterOffer(
            @PathVariable Long id,
            @RequestBody OfferRequest request) {

        Negotiation negotiation =
                negotiationService.counterOffer(
                        id,
                        request.getOffer()
                );

        return ResponseEntity.ok(
                NegotiationResponse.fromEntity(
                        negotiation
                )
        );
    }


    // =====================================================
    // ACCEPT
    // =====================================================

    @PostMapping("/{id}/accept")
    public ResponseEntity<NegotiationResponse> acceptNegotiation(
            @PathVariable Long id,
            Authentication authentication) {

        Long customerId =
                getUserId(authentication);

        Negotiation negotiation =
                negotiationService.acceptNegotiation(
                        customerId,
                        id
                );

        return ResponseEntity.ok(
                NegotiationResponse.fromEntity(
                        negotiation
                )
        );
    }


    // =====================================================
    // REJECT
    // =====================================================

    @PostMapping("/{id}/reject")
    public ResponseEntity<NegotiationResponse> rejectNegotiation(
            @PathVariable Long id,
            Authentication authentication) {

        Long customerId =
                getUserId(authentication);

        Negotiation negotiation =
                negotiationService.rejectNegotiation(
                        customerId,
                        id
                );

        return ResponseEntity.ok(
                NegotiationResponse.fromEntity(
                        negotiation
                )
        );
    }


    // =====================================================
    // GET USER ID FROM JWT
    // =====================================================

    private Long getUserId(
            Authentication authentication) {

        String email =
                authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        return user.getId();
    }
}