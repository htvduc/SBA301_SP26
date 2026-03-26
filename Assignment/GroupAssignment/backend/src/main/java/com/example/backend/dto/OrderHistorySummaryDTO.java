package com.example.backend.dto;

import com.example.backend.entities.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Lightweight row for waiter order history list (no order lines / items). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderHistorySummaryDTO {
    private UUID orderId;
    private UUID areaTableId;
    private String tableName;
    private String areaName;
    private OrderStatus status;
    private BigDecimal totalPrice;
    private BigDecimal paidAmount;
    private Instant createdAt;
    private Instant updatedAt;
    private long itemCount;
}
