package com.example.backend.dto;

import com.example.backend.entities.OrderLineStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderLineDTO {
    private UUID orderLineId;
    private UUID orderId;
    private OrderLineStatus orderLineStatus;
    private BigDecimal totalPrice;
    private Instant createdAt;
    private String tableName;
    private List<OrderItemDTO> orderItems;
}
