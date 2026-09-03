package com.soniya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateNegotiationRequest {

    private Long orderId;

    private Integer maxRounds;
}