package com.example.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailyRevenueDTO {
    private LocalDate date;
    private BigDecimal revenue;
    private int orderCount;
    private int completedOrders;
    private int cancelledOrders;

    public DailyRevenueDTO() {
    }

    public DailyRevenueDTO(LocalDate date, BigDecimal revenue, int orderCount, int completedOrders, int cancelledOrders) {
        this.date = date;
        this.revenue = revenue;
        this.orderCount = orderCount;
        this.completedOrders = completedOrders;
        this.cancelledOrders = cancelledOrders;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    public int getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(int orderCount) {
        this.orderCount = orderCount;
    }

    public int getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(int completedOrders) {
        this.completedOrders = completedOrders;
    }

    public int getCancelledOrders() {
        return cancelledOrders;
    }

    public void setCancelledOrders(int cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }
}
