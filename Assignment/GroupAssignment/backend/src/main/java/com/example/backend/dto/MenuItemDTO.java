package com.example.backend.dto;

import com.example.backend.entities.EntityStatus;
import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDTO {
    private UUID menuItemId;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private EntityStatus status;
    private boolean bestSeller;
    private boolean hasCustomization;
    private UUID restaurantId;
    private UUID categoryId;
    private Set<UUID> customizationIds;
    private String imageUrl;

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}