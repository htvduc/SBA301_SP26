package com.example.backend.exception;

import com.example.backend.entities.ReservationStatus;
import lombok.Getter;

import java.util.List;

@Getter
public class InvalidStatusTransitionException extends RuntimeException {
    private final ErrorCode errorCode;
    private final ReservationStatus currentStatus;
    private final ReservationStatus attemptedStatus;
    private final List<ReservationStatus> allowedTransitions;
    
    public InvalidStatusTransitionException(
            ReservationStatus currentStatus,
            ReservationStatus attemptedStatus,
            List<ReservationStatus> allowedTransitions) {
        super(String.format("Cannot transition from %s to %s. Allowed transitions: %s",
                currentStatus, attemptedStatus, allowedTransitions));
        this.errorCode = ErrorCode.INVALID_STATUS_TRANSITION;
        this.currentStatus = currentStatus;
        this.attemptedStatus = attemptedStatus;
        this.allowedTransitions = allowedTransitions;
    }
}
