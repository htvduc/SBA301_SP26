package com.example.backend.controller;


import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.BranchDTO;
import com.example.backend.entities.FeatureCode;
import com.example.backend.services.BranchService;
import com.example.backend.services.FeatureLimitCheckerService;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchService branchService;
    private final FeatureLimitCheckerService featureLimitCheckerService;

    public BranchController(BranchService branchService,
            FeatureLimitCheckerService featureLimitCheckerService) {
        this.branchService = branchService;
        this.featureLimitCheckerService = featureLimitCheckerService;
    }

    @GetMapping("")
    public ApiResponse<List<BranchDTO>> getAll() {
        ApiResponse<List<BranchDTO>> res = new ApiResponse<>();
        res.setResult(branchService.getAll());
        return res;
    }

    @GetMapping("/{id}")
    public ApiResponse<BranchDTO> getById(@PathVariable UUID id) {
        ApiResponse<BranchDTO> res = new ApiResponse<>();
        res.setResult(branchService.getById(id));
        return res;
    }

    @PostMapping("")
    public ApiResponse<BranchDTO> create(@Valid @RequestBody BranchDTO dto) {
        ApiResponse<BranchDTO> res = new ApiResponse<>();
        res.setResult(branchService.create(dto));
        return res;
    }

    @PutMapping("/{id}")
    public ApiResponse<BranchDTO> update(@PathVariable UUID id, @Valid @RequestBody BranchDTO dto) {
        ApiResponse<BranchDTO> res = new ApiResponse<>();
        res.setResult(branchService.update(id, dto));
        return res;
    }

    @PatchMapping("/{id}/contact-info")
    public ApiResponse<BranchDTO> updateContactInfo(@PathVariable UUID id, @RequestBody BranchDTO dto) {
        ApiResponse<BranchDTO> res = new ApiResponse<>();
        res.setResult(branchService.updateContactInfo(id, dto));
        return res;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        ApiResponse<Void> res = new ApiResponse<>();
        branchService.delete(id);
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ApiResponse<List<BranchDTO>> getByRestaurant(@PathVariable UUID restaurantId) {
        ApiResponse<List<BranchDTO>> res = new ApiResponse<>();
        res.setResult(branchService.getByRestaurant(restaurantId));
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}/active")
    public ApiResponse<List<BranchDTO>> getActiveByRestaurant(@PathVariable UUID restaurantId) {
        ApiResponse<List<BranchDTO>> res = new ApiResponse<>();
        res.setResult(branchService.getActiveByRestaurant(restaurantId));
        return res;
    }

    @GetMapping("/{branchId}/restaurant")
    public ApiResponse<UUID> getRestaurantByBranchId(@PathVariable UUID branchId) {
        ApiResponse<UUID> res = new ApiResponse<>();
        res.setResult(branchService.getRestaurantIdByBranchId(branchId));
        return res;
    }

    @GetMapping("/{branchId}/restaurant/slug")
    public ApiResponse<String> getRestaurantSlugByBranchId(@PathVariable UUID branchId) {
        ApiResponse<String> res = new ApiResponse<>();
        res.setResult(branchService.getRestaurantSlugByBranchId(branchId));
        return res;
    }

    @GetMapping("/owner/{ownerId}")
    public ApiResponse<List<BranchDTO>> getBranchesByOwner(@PathVariable UUID ownerId) {
        ApiResponse<List<BranchDTO>> res = new ApiResponse<>();
        res.setResult(branchService.getBranchesByOwner(ownerId));
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}/can-create")
    public ApiResponse<Boolean> canCreateBranch(@PathVariable UUID restaurantId) {
        ApiResponse<Boolean> res = new ApiResponse<>();
        res.setResult(branchService.canCreateBranch(restaurantId));
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}/limit")
    public ApiResponse<Integer> getBranchLimit(
            @PathVariable UUID restaurantId) {
        ApiResponse<Integer> res = new ApiResponse<>();
        try {
            int limit = featureLimitCheckerService.getLimitValue(
                    restaurantId,
                    FeatureCode.LIMIT_BRANCH_CREATION);
            res.setResult(limit);
            // -1 means unlimited (Premium package or no subscription)
            // 0 means no access (should not happen with current logic)
            // >0 means specific limit (Standard package)
            if (limit == -1) {
                res.setMessage("Unlimited branches");
            } else if (limit == 0) {
                res.setMessage("No active subscription");
            } else {
                res.setMessage("Limit: " + limit + " branches");
            }
        } catch (Exception e) {
            res.setResult(0);
            res.setMessage("Error retrieving limit");
        }
        return res;
    }
}
