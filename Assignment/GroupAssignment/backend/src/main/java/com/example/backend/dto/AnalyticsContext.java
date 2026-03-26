package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnalyticsContext {
    private BranchAnalyticsDTO analytics;
    private List<DailyRevenueDTO> dailyRevenue;
    private List<TopSellingItemDTO> topSellingItems;
    private List<OrderDistributionDTO> orderDistribution;
    private String timeframe;
    private String startDate;
    private String endDate;
}
