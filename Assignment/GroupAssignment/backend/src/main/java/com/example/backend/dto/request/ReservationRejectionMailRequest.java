package com.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationRejectionMailRequest {
    private String mail;
    private String customerName;
    private String restaurantName;
    private UUID reservationId;
    private LocalDateTime startTime;
    private String reason;
    private String branchPhone;
    private String branchEmail;
}
