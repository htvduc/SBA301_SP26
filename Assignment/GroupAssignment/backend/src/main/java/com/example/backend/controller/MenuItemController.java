package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.CustomizationDTO;
import com.example.backend.dto.MenuItemDTO;
import com.example.backend.dto.request.MenuItemCreateRequest;
import com.example.backend.entities.FeatureCode;
import com.example.backend.services.MenuItemService;
import com.example.backend.services.FeatureLimitCheckerService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    private final MenuItemService menuItemService;
    private final FeatureLimitCheckerService featureLimitCheckerService;

    public MenuItemController(MenuItemService menuItemService,
            FeatureLimitCheckerService featureLimitCheckerService) {
        this.menuItemService = menuItemService;
        this.featureLimitCheckerService = featureLimitCheckerService;
    }

    @GetMapping("")
    public ApiResponse<List<MenuItemDTO>> getAllByRestaurant(
            @RequestParam UUID restaurantId) {
        ApiResponse<List<MenuItemDTO>> res = new ApiResponse<>();
        res.setResult(menuItemService.getAllByRestaurant(restaurantId));
        return res;
    }

    @GetMapping("/{id}")
    public ApiResponse<MenuItemDTO> getById(@PathVariable UUID id) {
        ApiResponse<MenuItemDTO> res = new ApiResponse<>();
        res.setResult(menuItemService.getById(id));
        return res;
    }

    @PostMapping(value = "/create", consumes = { "multipart/form-data" })
    public ApiResponse<MenuItemDTO> create(
            @RequestPart("data") MenuItemCreateRequest request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        ApiResponse<MenuItemDTO> res = new ApiResponse<>();
        res.setResult(menuItemService.create(request, imageFile));
        return res;
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ApiResponse<MenuItemDTO> update(
            @PathVariable UUID id,
            @RequestPart("data") MenuItemCreateRequest request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        ApiResponse<MenuItemDTO> res = new ApiResponse<>();
        res.setResult(menuItemService.update(id, request, imageFile));
        return res;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        menuItemService.delete(id);
        return new ApiResponse<>();
    }

    @GetMapping("/{menuItemId}/branch/{branchId}/active")
    public ApiResponse<Boolean> isMenuItemActiveInBranch(
            @PathVariable UUID menuItemId,
            @PathVariable UUID branchId) {
        ApiResponse<Boolean> res = new ApiResponse<>();
        res.setResult(menuItemService.isMenuItemActiveInBranch(menuItemId, branchId));
        return res;
    }

    @PutMapping("/{menuItemId}/status")
    public ApiResponse<MenuItemDTO> setActiveStatus(
            @PathVariable UUID menuItemId,
            @RequestParam boolean active) {
        ApiResponse<MenuItemDTO> res = new ApiResponse<>();
        res.setResult(menuItemService.setActiveStatus(menuItemId, active));
        return res;
    }

    @PutMapping("/{menuItemId}/best-seller")
    public ApiResponse<MenuItemDTO> updateBestSeller(
            @PathVariable UUID menuItemId,
            @RequestParam boolean bestSeller) {
        ApiResponse<MenuItemDTO> res = new ApiResponse<>();
        res.setResult(menuItemService.updateBestSeller(menuItemId, bestSeller));
        return res;
    }

    @GetMapping("/customization/{menuItemId}")
    public ApiResponse<List<CustomizationDTO>> getCustomizationsOfMenuItem(@PathVariable UUID menuItemId) {
        ApiResponse<List<CustomizationDTO>> response = new ApiResponse<>();
        response.setResult(menuItemService.getCustomizationOfMenuItem(menuItemId));
        return response;
    }

    @GetMapping("/restaurant/{restaurantId}/can-create")
    public ApiResponse<Boolean> canCreateMenuItem(
            @PathVariable UUID restaurantId) {
        ApiResponse<Boolean> res = new ApiResponse<>();
        res.setResult(menuItemService.canCreateMenuItem(restaurantId));
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}/limit")
    public ApiResponse<Integer> getMenuItemLimit(
            @PathVariable UUID restaurantId) {
        ApiResponse<Integer> res = new ApiResponse<>();
        try {
            int limit = featureLimitCheckerService.getLimitValue(
                    restaurantId,
                    FeatureCode.LIMIT_MENU_ITEMS);
            res.setResult(limit);
            // -1 means unlimited (Premium package or no subscription)
            // 0 means no access (should not happen with current logic)
            // >0 means specific limit (Standard package)
            if (limit == -1) {
                res.setMessage("Unlimited menu items");
            } else if (limit == 0) {
                res.setMessage("No active subscription");
            } else {
                res.setMessage("Limit: " + limit + " menu items");
            }
        } catch (Exception e) {
            res.setResult(0);
            res.setMessage("Error retrieving limit");
        }
        return res;
    }

}