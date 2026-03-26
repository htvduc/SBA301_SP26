package com.example.backend.mapper;

import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entities.User;
import com.example.backend.services.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TokenMapper {
    
    private final JwtService jwtService;
    private final AuthenticationMapper authenticationMapper;
    
    public AuthenticationResponse mapToJwtTokens(User user, String clientIp, String userAgent) {
        log.info("Mapping user {} to JWT tokens", user.getEmail());
        
        // Generate access token using JwtService
        String accessToken = jwtService.generateAccessToken(user);
        
        // Generate refresh token using JwtService
        String refreshToken = jwtService.generateRefreshToken(user, clientIp, userAgent);
        
        // Map User to UserDTO
        UserResponse userDTO = authenticationMapper.toUserResponse(user);
        
        log.info("Successfully generated JWT tokens for user {}", user.getEmail());
        
        // Build and return AuthenticationResponse
        return new AuthenticationResponse(accessToken, refreshToken, userDTO);
    }
}
