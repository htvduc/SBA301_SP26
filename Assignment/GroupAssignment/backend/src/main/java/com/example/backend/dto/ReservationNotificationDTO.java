package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public class ReservationNotificationDTO {
    @NotBlank(message = "EVENT_ID_REQUIRED")
    private String eventId;
    
    @NotNull(message = "RESERVATION_ID_REQUIRED")
    private UUID reservationId;
    
    @NotNull(message = "BRANCH_ID_REQUIRED")
    private UUID branchId;
    
    @NotBlank(message = "CUSTOMER_NAME_REQUIRED")
    private String customerName;
    
    @NotBlank(message = "CUSTOMER_PHONE_REQUIRED")
    private String customerPhone;
    
    @NotBlank(message = "CUSTOMER_EMAIL_REQUIRED")
    private String customerEmail;
    
    @NotNull(message = "START_TIME_REQUIRED")
    private LocalDateTime startTime;
    
    @NotNull(message = "GUEST_NUMBER_REQUIRED")
    private Integer guestNumber;
    
    private String tableNumber;
    
    @NotNull(message = "TIMESTAMP_REQUIRED")
    private Instant timestamp;

    public ReservationNotificationDTO() {}

    public ReservationNotificationDTO(String eventId, UUID reservationId, UUID branchId, String customerName, String customerPhone, String customerEmail, LocalDateTime startTime, Integer guestNumber, String tableNumber, Instant timestamp) {
        this.eventId = eventId;
        this.reservationId = reservationId;
        this.branchId = branchId;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.customerEmail = customerEmail;
        this.startTime = startTime;
        this.guestNumber = guestNumber;
        this.tableNumber = tableNumber;
        this.timestamp = timestamp;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public UUID getReservationId() {
        return reservationId;
    }

    public void setReservationId(UUID reservationId) {
        this.reservationId = reservationId;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public Integer getGuestNumber() {
        return guestNumber;
    }

    public void setGuestNumber(Integer guestNumber) {
        this.guestNumber = guestNumber;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
