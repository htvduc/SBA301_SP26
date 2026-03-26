package com.example.backend.services;

import com.example.backend.repositories.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupService {
    
    private final RefreshTokenRepository refreshTokenRepository;

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Starting cleanup of expired refresh tokens");
        
        Instant now = Instant.now();
        int deletedCount = refreshTokenRepository.deleteExpiredTokens(now);
        
        log.info("Cleanup completed. Deleted {} expired refresh tokens", deletedCount);
    }
}
