package com.example.backend.exception;

import com.example.backend.dto.response.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ex.getErrorCode().getCode());
        response.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getStatusCode())
                .body(response);
    }

    @ExceptionHandler(JwtAuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleJwtAuthenticationException(JwtAuthenticationException ex) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ex.getErrorCode().getCode());
        response.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getStatusCode())
                .body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(BadCredentialsException ex) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ErrorCode.INVALID_CREDENTIALS.getCode());
        response.setMessage(ErrorCode.INVALID_CREDENTIALS.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(response);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleEntityNotFoundException(EntityNotFoundException ex) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(HttpStatus.NOT_FOUND.value());
        response.setMessage(ex.getMessage() != null ? ex.getMessage() : "Resource not found");
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ApiResponse<Map<String, String>> response = new ApiResponse<>();
        response.setCode(ErrorCode.INVALID_REQUEST.getCode());
        response.setMessage("Validation failed");
        response.setResult(errors);
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(InvalidAuthorizationCodeException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidAuthorizationCodeException(InvalidAuthorizationCodeException ex) {
        log.error("Invalid authorization code: {}", ex.getMessage());
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ex.getErrorCode().getCode());
        response.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getStatusCode())
                .body(response);
    }

    @ExceptionHandler(GoogleServiceUnavailableException.class)
    public ResponseEntity<ApiResponse<Void>> handleGoogleServiceUnavailableException(GoogleServiceUnavailableException ex) {
        log.error("Google service unavailable: {}", ex.getMessage());
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ex.getErrorCode().getCode());
        response.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getStatusCode())
                .body(response);
    }

    @ExceptionHandler(InvalidIdTokenException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidIdTokenException(InvalidIdTokenException ex) {
        log.error("Invalid ID token: {}", ex.getMessage());
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ex.getErrorCode().getCode());
        response.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getStatusCode())
                .body(response);
    }

    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ApiResponse<Void>> handleEmailNotVerifiedException(EmailNotVerifiedException ex) {
        log.error("Email not verified: {}", ex.getMessage());
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ex.getErrorCode().getCode());
        response.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getStatusCode())
                .body(response);
    }

    @ExceptionHandler(UserCancelledLoginException.class)
    public ResponseEntity<ApiResponse<Void>> handleUserCancelledLoginException(UserCancelledLoginException ex) {
        log.info("User cancelled login: {}", ex.getMessage());
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ex.getErrorCode().getCode());
        response.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getStatusCode())
                .body(response);
    }

    @ExceptionHandler(InvalidStatusTransitionException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleInvalidStatusTransitionException(InvalidStatusTransitionException ex) {
        log.error("Invalid status transition: {}", ex.getMessage());
        Map<String, Object> details = new HashMap<>();
        details.put("currentStatus", ex.getCurrentStatus());
        details.put("attemptedStatus", ex.getAttemptedStatus());
        details.put("allowedTransitions", ex.getAllowedTransitions());
        
        ApiResponse<Map<String, Object>> response = new ApiResponse<>();
        response.setCode(ex.getErrorCode().getCode());
        response.setMessage(ex.getMessage());
        response.setResult(details);
        return ResponseEntity
                .status(ex.getErrorCode().getStatusCode())
                .body(response);
    }

    @ExceptionHandler(ReservationValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleReservationValidationException(ReservationValidationException ex) {
        log.error("Reservation validation error: {}", ex.getMessage());
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ex.getErrorCode().getCode());
        response.setMessage(ex.getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getStatusCode())
                .body(response);
    }

    @ExceptionHandler(AIConsultantException.class)
    public ResponseEntity<ApiResponse<Void>> handleAIConsultantException(AIConsultantException ex) {
        log.error("AI Consultant service error: {}", ex.getMessage(), ex);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(HttpStatus.SERVICE_UNAVAILABLE.value());
        response.setMessage(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        if (isClientAbortException(ex)) {
            log.warn("Client disconnected before response was written: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }

        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ErrorCode.UNEXPECTED_EXCEPTION.getCode());
        response.setMessage(ex.getMessage() != null ? ex.getMessage() : ErrorCode.UNEXPECTED_EXCEPTION.getMessage());
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }

    @ExceptionHandler(AsyncRequestNotUsableException.class)
    public ResponseEntity<Void> handleAsyncRequestNotUsableException(AsyncRequestNotUsableException ex) {
        log.warn("Async response became unusable (client likely disconnected): {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    private boolean isClientAbortException(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof AsyncRequestNotUsableException) {
                return true;
            }

            String className = current.getClass().getName();
            String message = current.getMessage();
            if (className.contains("ClientAbortException")) {
                return true;
            }
            if (message != null) {
                String lowerMessage = message.toLowerCase();
                if (lowerMessage.contains("broken pipe")
                        || lowerMessage.contains("connection reset by peer")
                        || lowerMessage.contains("connection was aborted")) {
                    return true;
                }
            }
            current = current.getCause();
        }
        return false;
    }
}
