package com.example.backend.dto;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationVectorDTO {
    private UUID conversationId;
    private String userMessage;
    private String aiResponse;
    private Instant timestamp;
    private float similarityScore;
}
