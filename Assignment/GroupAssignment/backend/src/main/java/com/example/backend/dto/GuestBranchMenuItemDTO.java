package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GuestBranchMenuItemDTO {

    private UUID branchMenuItemId;
    private UUID branchId;
    private UUID menuItemId;
    private boolean available;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private UUID categoryId;
    private String imageUrl;
    private boolean bestSeller;
    private boolean hasCustomization;

}