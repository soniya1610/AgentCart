package com.soniya.dto;

import com.soniya.entity.Negotiation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NegotiationResponse {

    private Long id;

    private Long orderId;

    private Long customerId;

    private Long merchantId;

    private BigDecimal originalAmount;

    private BigDecimal currentOffer;

    private Integer maxRounds;

    private Integer currentRound;

    private String status;

    private String finalReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public static NegotiationResponse fromEntity(
            Negotiation negotiation) {

        return new NegotiationResponse(

                negotiation.getId(),

                negotiation.getOrderId(),

                negotiation.getCustomerId(),

                negotiation.getMerchantId(),

                negotiation.getOriginalAmount(),

                negotiation.getCurrentOffer(),

                negotiation.getMaxRounds(),

                negotiation.getCurrentRound(),

                negotiation.getStatus(),

                negotiation.getFinalReason(),

                negotiation.getCreatedAt(),

                negotiation.getUpdatedAt()
        );
    }
}