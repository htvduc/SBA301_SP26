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
@RequestMapping("/api/branches/{branchId}/analytics")
public class BranchAnalyticsController {

    @Autowired
    private RestaurantReportService restaurantReportService;

    @GetMapping
    public ResponseEntity<ApiResponse<BranchAnalyticsDTO>> getBranchAnalytics(
            @PathVariable UUID branchId,
            @RequestParam(defaultValue = "DAY") ReportType timeframe) {
        
        BranchAnalyticsDTO analytics = restaurantReportService.getBranchAnalytics(branchId, timeframe);
        
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/daily-revenue")
    public ResponseEntity<ApiResponse<List<DailyRevenueDTO>>> getDailyRevenue(
            @PathVariable UUID branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<DailyRevenueDTO> dailyRevenue = restaurantReportService.getBranchDailyRevenue(
                branchId, startDate, endDate);
        
        return ResponseEntity.ok(ApiResponse.success(dailyRevenue));
    }

    @GetMapping("/top-selling-items")
    public ResponseEntity<ApiResponse<List<TopSellingItemDTO>>> getTopSellingItems(
            @PathVariable UUID branchId,
            @RequestParam(defaultValue = "DAY") ReportType timeframe,
            @RequestParam(defaultValue = "10") int limit) {
        
        List<TopSellingItemDTO> topItems = restaurantReportService.getTopSellingItems(branchId, timeframe, limit);
        
        return ResponseEntity.ok(ApiResponse.success(topItems));
    }

    @GetMapping("/order-distribution")
    public ResponseEntity<ApiResponse<List<OrderDistributionDTO>>> getOrderDistribution(
            @PathVariable UUID branchId,
            @RequestParam LocalDate date) {
        
        List<OrderDistributionDTO> distribution = restaurantReportService.getOrderDistribution(branchId, date);
        
        return ResponseEntity.ok(ApiResponse.success(distribution));
    }
}
