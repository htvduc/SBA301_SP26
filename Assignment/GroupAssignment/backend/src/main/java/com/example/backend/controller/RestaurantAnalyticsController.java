package com.example.backend.controller;

import com.example.backend.dto.BranchAnalyticsDTO;
import com.example.backend.dto.DailyRevenueDTO;
import com.example.backend.dto.OrderDistributionDTO;
import com.example.backend.dto.TopSellingItemDTO;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.entities.ReportType;
import com.example.backend.services.RestaurantReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/analytics")
public class RestaurantAnalyticsController {

    @Autowired
    private RestaurantReportService restaurantReportService;

    @GetMapping
    public ResponseEntity<ApiResponse<BranchAnalyticsDTO>> getRestaurantAnalytics(
            @PathVariable UUID restaurantId,
            @RequestParam(defaultValue = "DAY") ReportType timeframe) {
        
        BranchAnalyticsDTO analytics = restaurantReportService.getRestaurantAnalytics(restaurantId, timeframe);
        
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/daily-revenue")
    public ResponseEntity<ApiResponse<List<DailyRevenueDTO>>> getDailyRevenue(
            @PathVariable UUID restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<DailyRevenueDTO> dailyRevenue = restaurantReportService.getRestaurantDailyRevenue(
                restaurantId, startDate, endDate);
        
        return ResponseEntity.ok(ApiResponse.success(dailyRevenue));
    }

    @GetMapping("/top-selling-items")
    public ResponseEntity<ApiResponse<List<TopSellingItemDTO>>> getTopSellingItems(
            @PathVariable UUID restaurantId,
            @RequestParam(defaultValue = "DAY") ReportType timeframe,
            @RequestParam(defaultValue = "10") int limit) {
        
        List<TopSellingItemDTO> topItems = restaurantReportService.getRestaurantTopSellingItems(restaurantId, timeframe, limit);
        
        return ResponseEntity.ok(ApiResponse.success(topItems));
    }

    @GetMapping("/order-distribution")
    public ResponseEntity<ApiResponse<List<OrderDistributionDTO>>> getOrderDistribution(
            @PathVariable UUID restaurantId,
            @RequestParam LocalDate date) {
        
        List<OrderDistributionDTO> distribution = restaurantReportService.getRestaurantOrderDistribution(restaurantId, date);
        
        return ResponseEntity.ok(ApiResponse.success(distribution));
    }
}