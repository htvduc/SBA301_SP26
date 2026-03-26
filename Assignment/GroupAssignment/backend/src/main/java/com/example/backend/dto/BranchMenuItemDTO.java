package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.List;
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
public class BranchMenuItemDTO extends MenuItemDTO {
    private boolean available;
    private UUID branchId;
    private UUID branchMenuItemId;
    private String categoryName;
    private List<CustomizationInfo> customizations;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomizationInfo {
        private String customizationId;
        private String name;
        private BigDecimal price;
        private CustomizationType customizationType;
    }
}