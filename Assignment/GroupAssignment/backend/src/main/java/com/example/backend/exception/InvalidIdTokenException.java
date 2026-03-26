package com.example.backend.exception;

public class InvalidIdTokenException extends RuntimeException {
    private final ErrorCode errorCode;
    
    public InvalidIdTokenException() {
        super(ErrorCode.INVALID_ID_TOKEN.getMessage());
        this.errorCode = ErrorCode.INVALID_ID_TOKEN;
    }
    
    public InvalidIdTokenException(Throwable cause) {
        super(ErrorCode.INVALID_ID_TOKEN.getMessage(), cause);
        this.errorCode = ErrorCode.INVALID_ID_TOKEN;
    }
    
    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
