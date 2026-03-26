package com.example.backend.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class ConversationMessage {
    private String userMessage;
    private String aiResponse;
    private Instant timestamp;
}
