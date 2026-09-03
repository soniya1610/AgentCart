package com.soniya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private Long id;

    private Long cartId;

    private Long productId;

    private String productName;

    private Integer quantity;

    private BigDecimal priceAtAdd;

    private BigDecimal totalPrice;
}