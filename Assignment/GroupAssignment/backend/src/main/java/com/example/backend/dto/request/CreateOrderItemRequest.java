package com.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderItemRequest {
    private UUID menuItemId;
    private int quantity;
    private String note;
    private List<CreateOrderItemCustomizationRequest> customizations;
}
