package com.soniya.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "negotiations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Negotiation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Long merchantId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal originalAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal currentOffer;

    @Column(nullable = false)
    private Integer maxRounds;

    @Column(nullable = false)
    private Integer currentRound;

    @Column(nullable = false)
    private String status;

    @Column
    private String finalReason;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}