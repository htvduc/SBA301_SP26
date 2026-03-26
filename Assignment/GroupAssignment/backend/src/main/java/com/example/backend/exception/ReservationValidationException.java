package com.example.backend.exception;

import lombok.Getter;

@Getter
public class ReservationValidationException extends RuntimeException {
    private final ErrorCode errorCode;
    
    public ReservationValidationException(String message) {
        super(message);
        this.errorCode = ErrorCode.RESERVATION_VALIDATION_ERROR;
    }
    
    public ReservationValidationException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = ErrorCode.RESERVATION_VALIDATION_ERROR;
    }
}
