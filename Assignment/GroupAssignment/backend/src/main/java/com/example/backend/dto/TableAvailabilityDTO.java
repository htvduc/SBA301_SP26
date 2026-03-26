package com.example.backend.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class TableAvailabilityDTO {
    private UUID tableId;
    private String tableTag;
    private Integer capacity;
    private String status; // AVAILABLE | RISKY | UNAVAILABLE
    private String reason; // Optional: why it's risky or unavailable
}
