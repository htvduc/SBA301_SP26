package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class OrderNotificationDTO {
    @NotBlank(message = "EVENT_ID_REQUIRED")
    private String eventId;
    
    @NotNull(message = "ORDER_ID_REQUIRED")
    private UUID orderId;
    
    @NotNull(message = "BRANCH_ID_REQUIRED")
    private UUID branchId;
    
    @NotBlank(message = "TABLE_NUMBER_REQUIRED")
    private String tableNumber;
    
    @NotBlank(message = "TABLE_NAME_REQUIRED")
    private String tableName;
    
    private String customerName;
    
    @NotNull(message = "ITEM_COUNT_REQUIRED")
    private Integer itemCount;
    
    @NotNull(message = "TOTAL_AMOUNT_REQUIRED")
    private BigDecimal totalAmount;
    
    @NotNull(message = "TIMESTAMP_REQUIRED")
    private Instant timestamp;

    public OrderNotificationDTO() {}

    public OrderNotificationDTO(String eventId, UUID orderId, UUID branchId, String tableNumber, String tableName, String customerName, Integer itemCount, BigDecimal totalAmount, Instant timestamp) {
        this.eventId = eventId;
        this.orderId = orderId;
        this.branchId = branchId;
        this.tableNumber = tableNumber;
        this.tableName = tableName;
        this.customerName = customerName;
        this.itemCount = itemCount;
        this.totalAmount = totalAmount;
        this.timestamp = timestamp;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Integer getItemCount() {
        return itemCount;
    }

    public void setItemCount(Integer itemCount) {
        this.itemCount = itemCount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
