package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class AdminStatisticsDTO {
    private Long totalUsers;
    private Long totalRestaurants;
    private Long activeSubscriptions;
    private BigDecimal monthlyRevenue;
    private List<PackageStatsDTO> packageStats;
    private List<WeeklyRevenueDTO> weeklyRevenue;

    public AdminStatisticsDTO() {}

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalRestaurants() {
        return totalRestaurants;
    }

    public void setTotalRestaurants(Long totalRestaurants) {
        this.totalRestaurants = totalRestaurants;
    }

    public Long getActiveSubscriptions() {
        return activeSubscriptions;
    }

    public void setActiveSubscriptions(Long activeSubscriptions) {
        this.activeSubscriptions = activeSubscriptions;
    }

    public BigDecimal getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(BigDecimal monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public List<PackageStatsDTO> getPackageStats() {
        return packageStats;
    }

    public void setPackageStats(List<PackageStatsDTO> packageStats) {
        this.packageStats = packageStats;
    }

    public List<WeeklyRevenueDTO> getWeeklyRevenue() {
        return weeklyRevenue;
    }

    public void setWeeklyRevenue(List<WeeklyRevenueDTO> weeklyRevenue) {
        this.weeklyRevenue = weeklyRevenue;
    }
}