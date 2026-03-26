package com.example.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class WeeklyRevenueDTO {
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private String weekLabel;
    private BigDecimal totalRevenue;
    private Long totalTransactions;

    public WeeklyRevenueDTO() {}

    public WeeklyRevenueDTO(LocalDate weekStart, LocalDate weekEnd, String weekLabel, BigDecimal totalRevenue, Long totalTransactions) {
        this.weekStart = weekStart;
        this.weekEnd = weekEnd;
        this.weekLabel = weekLabel;
        this.totalRevenue = totalRevenue;
        this.totalTransactions = totalTransactions;
    }

    public LocalDate getWeekStart() {
        return weekStart;
    }

    public void setWeekStart(LocalDate weekStart) {
        this.weekStart = weekStart;
    }

    public LocalDate getWeekEnd() {
        return weekEnd;
    }

    public void setWeekEnd(LocalDate weekEnd) {
        this.weekEnd = weekEnd;
    }

    public String getWeekLabel() {
        return weekLabel;
    }

    public void setWeekLabel(String weekLabel) {
        this.weekLabel = weekLabel;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(Long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }
}