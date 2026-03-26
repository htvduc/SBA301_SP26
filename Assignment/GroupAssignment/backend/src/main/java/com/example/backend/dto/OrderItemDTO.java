package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private UUID orderItemId;
    private UUID menuItemId;
    private String menuItemName;
    private String menuItemImageUrl;
    private BigDecimal menuItemPrice;
    private BigDecimal discountedPrice;
    private int quantity;
    private BigDecimal totalPrice;
    private String note;
    private List<OrderItemCustomizationDTO> customizations;
}
