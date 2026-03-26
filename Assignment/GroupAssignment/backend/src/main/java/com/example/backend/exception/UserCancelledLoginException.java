package com.example.backend.exception;

public class UserCancelledLoginException extends RuntimeException {
    private final ErrorCode errorCode;
    
    public UserCancelledLoginException() {
        super(ErrorCode.USER_CANCELLED_LOGIN.getMessage());
        this.errorCode = ErrorCode.USER_CANCELLED_LOGIN;
    }
    
    public UserCancelledLoginException(Throwable cause) {
        super(ErrorCode.USER_CANCELLED_LOGIN.getMessage(), cause);
        this.errorCode = ErrorCode.USER_CANCELLED_LOGIN;
    }
    
    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
