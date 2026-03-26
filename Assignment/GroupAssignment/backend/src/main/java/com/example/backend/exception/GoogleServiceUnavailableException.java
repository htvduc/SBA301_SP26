package com.example.backend.exception;

public class GoogleServiceUnavailableException extends RuntimeException {
    private final ErrorCode errorCode;
    
    public GoogleServiceUnavailableException() {
        super(ErrorCode.GOOGLE_SERVICE_UNAVAILABLE.getMessage());
        this.errorCode = ErrorCode.GOOGLE_SERVICE_UNAVAILABLE;
    }
    
    public GoogleServiceUnavailableException(Throwable cause) {
        super(ErrorCode.GOOGLE_SERVICE_UNAVAILABLE.getMessage(), cause);
        this.errorCode = ErrorCode.GOOGLE_SERVICE_UNAVAILABLE;
    }
    
    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
