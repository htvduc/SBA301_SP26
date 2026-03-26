package com.example.backend.dto;

import com.example.backend.entities.DiscountType;
import com.example.backend.entities.PromotionStatus;
import com.example.backend.entities.PromotionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionDTO {
    private UUID promotionId;
    private String name;
    private String description;
    private String code;
    private PromotionType promotionType;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountValue;
    private Instant startDate;
    private Instant endDate;
    private PromotionStatus status;
    private Set<MenuItemDTO> menuItems;
}
