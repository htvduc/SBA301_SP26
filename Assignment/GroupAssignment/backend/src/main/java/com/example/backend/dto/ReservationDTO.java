package com.example.backend.dto;


import com.example.backend.entities.ReservationStatus;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ReservationDTO {

    private UUID reservationId;

    private UUID branchId;

    private UUID areaTableId;

    private LocalDateTime startTime;

    private String customerName;

    private String customerPhone;

    private String customerEmail;

    private int guestNumber;

    private String note;

    private ReservationStatus status;

    private Instant arrivalTime;

    private Instant completionTime;

    private String rejectionReason;

    private Instant createdAt;

    private Instant updatedAt;

    private String branchName;

    private String branchAddress;

    private String tableTag;

    private Integer tableCapacity;

    private Long serviceDurationMinutes;

    private Integer estimatedDurationMinutes;
}