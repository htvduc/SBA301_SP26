package com.example.backend.dto.request;

import java.time.LocalDateTime;
import java.util.UUID;

import com.example.backend.validator.Phone;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateReservationRequest {
    
    @NotNull(message = "BRANCH_ID_REQUIRED")
    private UUID branchId;
    
    private UUID areaTableId;
    
    @NotNull(message = "START_TIME_REQUIRED")
    @Future(message = "START_TIME_MUST_BE_IN_FUTURE")
    private LocalDateTime startTime;
    
    @NotBlank(message = "CUSTOMER_NAME_REQUIRED")
    private String customerName;
    
    @NotBlank(message = "CUSTOMER_PHONE_REQUIRED")
    @Phone(message = "INVALID_PHONE_NUMBER")
    private String customerPhone;
    
    @Email(message = "INVALID_EMAIL")
    private String customerEmail;
    
    @NotNull(message = "GUEST_NUMBER_REQUIRED")
    @Min(value = 1, message = "GUEST_NUMBER_MUST_BE_POSITIVE")
    private Integer guestNumber;
    
    private String note;

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public UUID getAreaTableId() {
        return areaTableId;
    }

    public void setAreaTableId(UUID areaTableId) {
        this.areaTableId = areaTableId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
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

    public Integer getGuestNumber() {
        return guestNumber;
    }

    public void setGuestNumber(Integer guestNumber) {
        this.guestNumber = guestNumber;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
