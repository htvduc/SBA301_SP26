package com.example.backend.dto;

import java.util.Map;

public class ReservationAnalyticsDTO {
    private long totalReservations;
    private long pendingCount;
    private long approvedCount;
    private long confirmedCount;
    private long completedCount;
    private long cancelledCount;
    private long noShowCount;
    private double approvalRate;
    private double noShowRate;
    private double averageServiceDurationMinutes;
    private Map<String, Long> reservationsByDate;
    private Map<String, Long> reservationsByTimeSlot;

    public long getTotalReservations() {
        return totalReservations;
    }

    public void setTotalReservations(long totalReservations) {
        this.totalReservations = totalReservations;
    }

    public long getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(long pendingCount) {
        this.pendingCount = pendingCount;
    }

    public long getApprovedCount() {
        return approvedCount;
    }

    public void setApprovedCount(long approvedCount) {
        this.approvedCount = approvedCount;
    }

    public long getConfirmedCount() {
        return confirmedCount;
    }

    public void setConfirmedCount(long confirmedCount) {
        this.confirmedCount = confirmedCount;
    }

    public long getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(long completedCount) {
        this.completedCount = completedCount;
    }

    public long getCancelledCount() {
        return cancelledCount;
    }

    public void setCancelledCount(long cancelledCount) {
        this.cancelledCount = cancelledCount;
    }

    public long getNoShowCount() {
        return noShowCount;
    }

    public void setNoShowCount(long noShowCount) {
        this.noShowCount = noShowCount;
    }

    public double getApprovalRate() {
        return approvalRate;
    }

    public void setApprovalRate(double approvalRate) {
        this.approvalRate = approvalRate;
    }

    public double getNoShowRate() {
        return noShowRate;
    }

    public void setNoShowRate(double noShowRate) {
        this.noShowRate = noShowRate;
    }

    public double getAverageServiceDurationMinutes() {
        return averageServiceDurationMinutes;
    }

    public void setAverageServiceDurationMinutes(double averageServiceDurationMinutes) {
        this.averageServiceDurationMinutes = averageServiceDurationMinutes;
    }

    public Map<String, Long> getReservationsByDate() {
        return reservationsByDate;
    }

    public void setReservationsByDate(Map<String, Long> reservationsByDate) {
        this.reservationsByDate = reservationsByDate;
    }

    public Map<String, Long> getReservationsByTimeSlot() {
        return reservationsByTimeSlot;
    }

    public void setReservationsByTimeSlot(Map<String, Long> reservationsByTimeSlot) {
        this.reservationsByTimeSlot = reservationsByTimeSlot;
    }
}
