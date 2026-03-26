package com.example.backend.exception;

public class InvalidAuthorizationCodeException extends RuntimeException {
    private final ErrorCode errorCode;
    
    public InvalidAuthorizationCodeException() {
        super(ErrorCode.INVALID_AUTHORIZATION_CODE.getMessage());
        this.errorCode = ErrorCode.INVALID_AUTHORIZATION_CODE;
    }
    
    public InvalidAuthorizationCodeException(Throwable cause) {
        super(ErrorCode.INVALID_AUTHORIZATION_CODE.getMessage(), cause);
        this.errorCode = ErrorCode.INVALID_AUTHORIZATION_CODE;
    }
    
    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
