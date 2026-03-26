package com.example.backend.dto;

import java.time.LocalDate;
import java.util.List;

import com.example.backend.entities.ReservationStatus;

public class ReservationFilterParams {
    private List<ReservationStatus> statuses;
    private LocalDate startDate;
    private LocalDate endDate;
    private String search;

    public List<ReservationStatus> getStatuses() {
        return statuses;
    }

    public void setStatuses(List<ReservationStatus> statuses) {
        this.statuses = statuses;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getSearch() {
        return search;
    }

    public void setSearch(String search) {
        this.search = search;
    }
}
