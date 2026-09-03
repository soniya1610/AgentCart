package com.soniya.service;

import com.soniya.entity.Negotiation;
import com.soniya.entity.Order;
import com.soniya.repository.NegotiationRepository;
import com.soniya.repository.OrderRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class NegotiationService {

    private final NegotiationRepository negotiationRepository;
    private final OrderRepository orderRepository;

    public NegotiationService(
            NegotiationRepository negotiationRepository,
            OrderRepository orderRepository) {

        this.negotiationRepository = negotiationRepository;
        this.orderRepository = orderRepository;
    }

    // =====================================================
    // START NEGOTIATION
    // =====================================================

    @Transactional
    public Negotiation startNegotiation(
            Long customerId,
            Long orderId,
            Integer maxRounds) {

        if (maxRounds == null ||
                maxRounds <= 0 ||
                maxRounds > 10) {

            throw new RuntimeException(
                    "Maximum rounds must be between 1 and 10"
            );
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));

        if (!order.getUserId().equals(customerId)) {

            throw new RuntimeException(
                    "You cannot negotiate this order"
            );
        }

        if (negotiationRepository
                .findByOrderId(orderId)
                .isPresent()) {

            throw new RuntimeException(
                    "Negotiation already exists for this order"
            );
        }

        Negotiation negotiation = new Negotiation();

        negotiation.setOrderId(orderId);
        negotiation.setCustomerId(customerId);

        // Merchant ID will be connected later
        // with actual merchant/product relationship.
        negotiation.setMerchantId(0L);

        negotiation.setOriginalAmount(
                order.getTotalAmount()
        );

        negotiation.setCurrentOffer(
                order.getTotalAmount()
        );

        negotiation.setMaxRounds(maxRounds);

        negotiation.setCurrentRound(0);

        negotiation.setStatus(
                "NEGOTIATING"
        );

        negotiation.setFinalReason(null);

        negotiation.setCreatedAt(
                LocalDateTime.now()
        );

        negotiation.setUpdatedAt(
                LocalDateTime.now()
        );

        return negotiationRepository.save(
                negotiation
        );
    }


    // =====================================================
    // GET NEGOTIATION
    // =====================================================

    public Negotiation getNegotiation(
            Long customerId,
            Long negotiationId) {

        Negotiation negotiation =
                negotiationRepository
                        .findById(negotiationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Negotiation not found"
                                ));

        if (!negotiation
                .getCustomerId()
                .equals(customerId)) {

            throw new RuntimeException(
                    "You cannot access this negotiation"
            );
        }

        return negotiation;
    }


    // =====================================================
    // CUSTOMER MAKE OFFER
    // =====================================================

    @Transactional
    public Negotiation makeOffer(
            Long customerId,
            Long negotiationId,
            BigDecimal offer) {

        if (offer == null ||
                offer.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Offer must be greater than zero"
            );
        }

        Negotiation negotiation =
                getNegotiation(
                        customerId,
                        negotiationId
                );

        if (!"NEGOTIATING".equals(
                negotiation.getStatus())) {

            throw new RuntimeException(
                    "Negotiation is already closed"
            );
        }

        if (negotiation.getCurrentRound()
                >= negotiation.getMaxRounds()) {

            negotiation.setStatus("EXPIRED");

            negotiation.setFinalReason(
                    "Maximum negotiation rounds reached"
            );

            negotiation.setUpdatedAt(
                    LocalDateTime.now()
            );

            return negotiationRepository.save(
                    negotiation
            );
        }

        // Update offer
        negotiation.setCurrentOffer(offer);

        // Increase round
        negotiation.setCurrentRound(
                negotiation.getCurrentRound() + 1
        );

        negotiation.setUpdatedAt(
                LocalDateTime.now()
        );

        return negotiationRepository.save(
                negotiation
        );
    }


    // =====================================================
    // MERCHANT COUNTER OFFER
    // =====================================================

    @Transactional
    public Negotiation counterOffer(
            Long negotiationId,
            BigDecimal offer) {

        if (offer == null ||
                offer.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Counter offer must be greater than zero"
            );
        }

        Negotiation negotiation =
                negotiationRepository
                        .findById(negotiationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Negotiation not found"
                                ));

        if (!"NEGOTIATING".equals(
                negotiation.getStatus())) {

            throw new RuntimeException(
                    "Negotiation is already closed"
            );
        }

        if (negotiation.getCurrentRound()
                >= negotiation.getMaxRounds()) {

            negotiation.setStatus("EXPIRED");

            negotiation.setFinalReason(
                    "Maximum negotiation rounds reached"
            );

            negotiation.setUpdatedAt(
                    LocalDateTime.now()
            );

            return negotiationRepository.save(
                    negotiation
            );
        }

        negotiation.setCurrentOffer(offer);

        negotiation.setCurrentRound(
                negotiation.getCurrentRound() + 1
        );

        negotiation.setUpdatedAt(
                LocalDateTime.now()
        );

        return negotiationRepository.save(
                negotiation
        );
    }


    // =====================================================
    // ACCEPT NEGOTIATION
    // =====================================================

    @Transactional
    public Negotiation acceptNegotiation(
            Long customerId,
            Long negotiationId) {

        Negotiation negotiation =
                getNegotiation(
                        customerId,
                        negotiationId
                );

        if (!"NEGOTIATING".equals(
                negotiation.getStatus())) {

            throw new RuntimeException(
                    "Negotiation is already closed"
            );
        }

        negotiation.setStatus("ACCEPTED");

        negotiation.setFinalReason(
                "Offer accepted"
        );

        negotiation.setUpdatedAt(
                LocalDateTime.now()
        );

        return negotiationRepository.save(
                negotiation
        );
    }


    // =====================================================
    // REJECT NEGOTIATION
    // =====================================================

    @Transactional
    public Negotiation rejectNegotiation(
            Long customerId,
            Long negotiationId) {

        Negotiation negotiation =
                getNegotiation(
                        customerId,
                        negotiationId
                );

        if (!"NEGOTIATING".equals(
                negotiation.getStatus())) {

            throw new RuntimeException(
                    "Negotiation is already closed"
            );
        }

        negotiation.setStatus("REJECTED");

        negotiation.setFinalReason(
                "Negotiation rejected"
        );

        negotiation.setUpdatedAt(
                LocalDateTime.now()
        );

        return negotiationRepository.save(
                negotiation
        );
    }
}