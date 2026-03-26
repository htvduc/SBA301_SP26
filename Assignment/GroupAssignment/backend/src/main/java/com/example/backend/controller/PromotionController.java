package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.PromotionDTO;
import com.example.backend.dto.request.CreatePromotionRequest;
import com.example.backend.entities.PromotionStatus;
import com.example.backend.services.PromotionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @PostMapping("/owner/promotions")
    public ApiResponse<PromotionDTO> createPromotion(@RequestBody CreatePromotionRequest request) {
        return ApiResponse.success(promotionService.createPromotion(request.getRestaurantId(), request));
    }

    @GetMapping("/owner/promotions/restaurant/{restaurantId}")
    public ApiResponse<List<PromotionDTO>> getPromotionsByRestaurant(@PathVariable UUID restaurantId) {
        return ApiResponse.success(promotionService.getPromotions(restaurantId));
    }

    @GetMapping("/manager/promotions/restaurant/{restaurantId}/active")
    public ApiResponse<List<PromotionDTO>> getActivePromotions(@PathVariable UUID restaurantId) {
        return ApiResponse.success(promotionService.getActivePromotions(restaurantId));
    }

    @PutMapping("/owner/promotions/{promotionId}")
    public ApiResponse<PromotionDTO> updatePromotion(@PathVariable UUID promotionId, @RequestBody CreatePromotionRequest request) {
        return ApiResponse.success(promotionService.updatePromotion(promotionId, request));
    }

    @DeleteMapping("/owner/promotions/{promotionId}")
    public ApiResponse<Void> deletePromotion(@PathVariable UUID promotionId) {
        promotionService.deletePromotion(promotionId);
        return ApiResponse.success("Promotion deleted successfully");
    }

    @GetMapping("/owner/promotions/{promotionId}")
    public ApiResponse<PromotionDTO> getPromotionById(@PathVariable UUID promotionId) {
        return ApiResponse.success(promotionService.getPromotionById(promotionId));
    }
    @PatchMapping("/owner/promotions/{promotionId}/status")
    public ApiResponse<PromotionDTO> updatePromotionStatus(@PathVariable UUID promotionId, @RequestParam PromotionStatus status) {
        return ApiResponse.success(promotionService.updatePromotionStatus(promotionId, status));
    }
}
