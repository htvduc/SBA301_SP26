package com.example.backend.exception;

public class AIConsultantException extends RuntimeException {
    public AIConsultantException(String message) {
        super(message);
    }
    
    public AIConsultantException(String message, Throwable cause) {
        super(message, cause);
    }
}
