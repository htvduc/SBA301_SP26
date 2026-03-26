package com.example.backend.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import com.example.backend.entities.CustomizationType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomizationCreateRequest {
    private String name;
    private BigDecimal price;
    private UUID restaurantId;
    private CustomizationType customizationType;

    private UUID categoryId;
    private UUID menuItemId;
}
