package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Value;

import com.example.backend.dto.RestaurantDTO;
import com.example.backend.entities.Restaurant;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class RestaurantMapper {

    @Value("${frontend.base-url}")
    private String webUrl;

    @Mapping(source = "user.userId", target = "userId")
    public abstract RestaurantDTO toRestaurantDto(Restaurant restaurant);

    @Mapping(source = "userId", target = "user.userId")
    public abstract Restaurant toRestaurant(RestaurantDTO dto);
    
    // Public method to add full URL building - only for publicUrl field
    public RestaurantDTO toRestaurantDtoWithFullUrl(Restaurant restaurant) {
        if (restaurant == null) {
            return null;
        }
        
        RestaurantDTO dto = toRestaurantDto(restaurant);
        
        // Only build full URL for publicUrl field
        if (dto != null && dto.getPublicUrl() != null) {
            String slug = dto.getPublicUrl();
            // If already a full URL, keep as-is (backward compatibility)
            if (!slug.startsWith("http://") && !slug.startsWith("https://")) {
                // Build full URL from slug
                dto.setPublicUrl(webUrl + "/" + slug);
            }
        }
        
        return dto;
    }
}
