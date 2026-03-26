package com.example.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Data
@Configuration
@ConfigurationProperties(prefix = "ai.vector")
@Validated
public class VectorConfigProperties {
    
    private int topK = 5;
    
    private double similarityThreshold = 0.7;
    
    private int maxContextTokens = 3000;
    
    private String embeddingModel = "amazon.titan-embed-text-v2:0";
    
    private Retry retry = new Retry();
    
    @Data
    public static class Retry {
        private int maxAttempts = 3;
        private long backoffMs = 1000;
    }
}
