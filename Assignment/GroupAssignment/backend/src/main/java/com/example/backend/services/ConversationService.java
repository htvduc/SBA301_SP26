package com.example.backend.services;

import com.example.backend.dto.ConversationMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CONVERSATION_KEY_PREFIX = "ai:conversation:";
    private static final Duration SESSION_TTL = Duration.ofHours(24);
    private static final int MAX_HISTORY_SIZE = 20;

    public List<ConversationMessage> getHistory(String sessionId) {
        String key = CONVERSATION_KEY_PREFIX + sessionId;
        List<Object> rawMessages = redisTemplate.opsForList().range(key, 0, -1);

        if (rawMessages == null || rawMessages.isEmpty()) {
            return new ArrayList<>();
        }

        return rawMessages.stream()
                .map(obj -> objectMapper.convertValue(obj, ConversationMessage.class))
                .collect(Collectors.toList());
    }

    public void saveMessage(String sessionId, String userMessage, String aiResponse) {
        String key = CONVERSATION_KEY_PREFIX + sessionId;

        ConversationMessage message = new ConversationMessage();
        message.setUserMessage(userMessage);
        message.setAiResponse(aiResponse);
        message.setTimestamp(Instant.now());

        redisTemplate.opsForList().rightPush(key, message);

        Long size = redisTemplate.opsForList().size(key);
        if (size != null && size > MAX_HISTORY_SIZE) {
            redisTemplate.opsForList().trim(key, size - MAX_HISTORY_SIZE, -1);
        }

        redisTemplate.expire(key, SESSION_TTL);
    }

    public void clearSession(String sessionId) {
        String key = CONVERSATION_KEY_PREFIX + sessionId;
        redisTemplate.delete(key);
    }
}
