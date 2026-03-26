package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AIConsultantResponse {
    private String response;
    private String sessionId;
    private Instant timestamp;
}
