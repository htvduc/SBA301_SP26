package com.example.backend.exception;

public class EmailNotVerifiedException extends RuntimeException {
    private final ErrorCode errorCode;
    
    public EmailNotVerifiedException() {
        super(ErrorCode.EMAIL_NOT_VERIFIED.getMessage());
        this.errorCode = ErrorCode.EMAIL_NOT_VERIFIED;
    }
    
    public EmailNotVerifiedException(Throwable cause) {
        super(ErrorCode.EMAIL_NOT_VERIFIED.getMessage(), cause);
        this.errorCode = ErrorCode.EMAIL_NOT_VERIFIED;
    }
    
    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
