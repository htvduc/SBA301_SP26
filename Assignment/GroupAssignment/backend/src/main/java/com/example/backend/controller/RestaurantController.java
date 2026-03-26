package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.RestaurantDTO;
import com.example.backend.dto.request.RestaurantCreateRequest;
import com.example.backend.entities.FeatureCode;
import com.example.backend.services.FeatureLimitCheckerService;
import com.example.backend.services.RestaurantService;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final FeatureLimitCheckerService featureLimitCheckerService;

    public RestaurantController(RestaurantService restaurantService,
                                FeatureLimitCheckerService featureLimitCheckerService) {
        this.restaurantService = restaurantService;
        this.featureLimitCheckerService = featureLimitCheckerService;
    }

    @GetMapping("")
    public ApiResponse<List<RestaurantDTO>> getAll() {
        ApiResponse<List<RestaurantDTO>> res = new ApiResponse<>();
        res.setResult(restaurantService.getAll());
        return res;
    }

    @GetMapping("/{id}")
    public ApiResponse<RestaurantDTO> getById(@PathVariable UUID id) {
        ApiResponse<RestaurantDTO> res = new ApiResponse<>();
        res.setResult(restaurantService.getById(id));
        return res;
    }

    @PostMapping("")
    public ApiResponse<RestaurantDTO> create(@RequestBody RestaurantCreateRequest request) {
        ApiResponse<RestaurantDTO> res = new ApiResponse<>();
        res.setResult(restaurantService.create(request));
        return res;
    }

    @PutMapping("/{id}")
    public ApiResponse<RestaurantDTO> update(@PathVariable UUID id, @RequestBody RestaurantDTO dto) {
        ApiResponse<RestaurantDTO> res = new ApiResponse<>();
        res.setResult(restaurantService.update(id, dto));
        return res;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        ApiResponse<Void> res = new ApiResponse<>();
        restaurantService.delete(id);
        return res;
    }

    @GetMapping("/owner/{userId}")
    public ApiResponse<List<RestaurantDTO>> getByOwner(@PathVariable UUID userId) {
        ApiResponse<List<RestaurantDTO>> res = new ApiResponse<>();
        res.setResult(restaurantService.getByOwner(userId));
        return res;
    }

    @GetMapping("/{restaurantId}/features/ai-assistant/limit")
    public ApiResponse<Integer> getAIAssistantLimit(@PathVariable UUID restaurantId) {
        ApiResponse<Integer> res = new ApiResponse<>();
        int limit = featureLimitCheckerService.getLimitValue(restaurantId, FeatureCode.AI_ASSISTANT);
        res.setResult(limit);
        return res;
    }
}
