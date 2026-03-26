package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemCustomizationDTO {
    private UUID orderItemCustomizationId;
    private UUID customizationId;
    private String customizationName;
    private int quantity;
    private BigDecimal totalPrice;
}
