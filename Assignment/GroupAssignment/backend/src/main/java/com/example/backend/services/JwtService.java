package com.example.backend.services;

import com.example.backend.config.JwtProperties;
import com.example.backend.entities.RefreshToken;
import com.example.backend.entities.StaffAccount;
import com.example.backend.entities.User;
import com.example.backend.exception.ErrorCode;
import com.example.backend.exception.JwtAuthenticationException;
import com.example.backend.repositories.RefreshTokenRepository;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtService {
    
    private final JwtProperties jwtProperties;
    private final RefreshTokenRepository refreshTokenRepository;
    
    public String generateAccessToken(User user) {
        try {
            JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
            
            Instant now = Instant.now();
            Instant expiry = now.plusSeconds(jwtProperties.getAccessTokenExpiration());
            
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getUserId().toString())
                    .claim("email", user.getEmail())
                    .claim("role", user.getRole().getName().name())
                    .claim("scope", "ROLE_" + user.getRole().getName().name())
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(expiry))
                    .jwtID(UUID.randomUUID().toString())
                    .build();
            
            Payload payload = new Payload(claimsSet.toJSONObject());
            JWSObject jwsObject = new JWSObject(header, payload);
            
            jwsObject.sign(new MACSigner(jwtProperties.getSecretKey().getBytes()));
            
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Error generating access token", e);
            throw new RuntimeException("Error generating access token", e);
        }
    }
    
    public String generateAccessToken(StaffAccount staffAccount) {
        try {
            JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
            
            Instant now = Instant.now();
            Instant expiry = now.plusSeconds(jwtProperties.getAccessTokenExpiration());
            
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(staffAccount.getStaffAccountId().toString())
                    .claim("username", staffAccount.getUsername())
                    .claim("role", staffAccount.getRole().getName().name())
                    .claim("scope", "ROLE_" + staffAccount.getRole().getName().name())
                    .claim("userType", "STAFF")
                    .claim("branchId", staffAccount.getBranch().getBranchId().toString())
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(expiry))
                    .jwtID(UUID.randomUUID().toString())
                    .build();
            
            Payload payload = new Payload(claimsSet.toJSONObject());
            JWSObject jwsObject = new JWSObject(header, payload);
            
            jwsObject.sign(new MACSigner(jwtProperties.getSecretKey().getBytes()));
            
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Error generating access token for staff", e);
            throw new RuntimeException("Error generating access token for staff", e);
        }
    }
    
    @Transactional
    public String generateRefreshToken(User user, String clientIp, String userAgent) {
        String tokenId = UUID.randomUUID().toString();
        String tokenString = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        
        String tokenHash;
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            var hashBytes = digest.digest(tokenString.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            tokenHash = bytesToHex(hashBytes);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
        
        var now = Instant.now();
        var expiry = now.plusSeconds(jwtProperties.getRefreshTokenExpiration());
        
        var refreshToken = new RefreshToken();
        refreshToken.setId(tokenId);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setUser(user);
        refreshToken.setIssuedAt(now);
        refreshToken.setExpiresAt(expiry);
        refreshToken.setClientIp(clientIp);
        refreshToken.setUserAgent(userAgent);
        
        refreshTokenRepository.save(refreshToken);
        
        return tokenId + ":" + tokenString;
    }
    
    @Transactional
    public String generateRefreshToken(StaffAccount staffAccount, String clientIp, String userAgent) {
        String tokenId = UUID.randomUUID().toString();
        String tokenString = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        
        String tokenHash;
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            var hashBytes = digest.digest(tokenString.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            tokenHash = bytesToHex(hashBytes);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
        
        var now = Instant.now();
        var expiry = now.plusSeconds(jwtProperties.getRefreshTokenExpiration());
        
        var refreshToken = new RefreshToken();
        refreshToken.setId(tokenId);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setStaffAccount(staffAccount);
        refreshToken.setIssuedAt(now);
        refreshToken.setExpiresAt(expiry);
        refreshToken.setClientIp(clientIp);
        refreshToken.setUserAgent(userAgent);
        
        refreshTokenRepository.save(refreshToken);
        
        return tokenId + ":" + tokenString;
    }
    
    private String bytesToHex(byte[] bytes) {
        var hexString = new StringBuilder(2 * bytes.length);
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
    
    public SignedJWT validateAccessToken(String token) {
        try {
            JWSVerifier verifier = new MACVerifier(jwtProperties.getSecretKey().getBytes());
            SignedJWT signedJWT = SignedJWT.parse(token);
            
            if (!signedJWT.verify(verifier)) {
                throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_SIGNATURE);
            }
            
            Instant expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime().toInstant();
            if (expirationTime.isBefore(Instant.now())) {
                throw new JwtAuthenticationException(ErrorCode.JWT_EXPIRED);
            }
            
            return signedJWT;
        } catch (JOSEException e) {
            throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_SIGNATURE, e);
        } catch (ParseException e) {
            throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_FORMAT, e);
        }
    }
    
    @Transactional(readOnly = true)
    public User validateRefreshToken(String refreshToken) {
        String[] parts = refreshToken.split(":", 2);
        if (parts.length != 2) {
            throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_FORMAT);
        }
        
        String tokenId = parts[0];
        String tokenString = parts[1];
        
        RefreshToken storedToken = refreshTokenRepository.findById(tokenId)
                .orElseThrow(() -> new JwtAuthenticationException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));
        
        var now = Instant.now();
        if (storedToken.getExpiresAt().isBefore(now)) {
            throw new JwtAuthenticationException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }
        
        String tokenHash;
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            var hashBytes = digest.digest(tokenString.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            tokenHash = bytesToHex(hashBytes);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
        
        if (!tokenHash.equals(storedToken.getTokenHash())) {
            throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_SIGNATURE);
        }
        
        return storedToken.getUser();
    }
    
    @Transactional(readOnly = true)
    public StaffAccount validateStaffRefreshToken(String refreshToken) {
        String[] parts = refreshToken.split(":", 2);
        if (parts.length != 2) {
            throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_FORMAT);
        }
        
        String tokenId = parts[0];
        String tokenString = parts[1];
        
        RefreshToken storedToken = refreshTokenRepository.findById(tokenId)
                .orElseThrow(() -> new JwtAuthenticationException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));
        
        if (storedToken.getStaffAccount() == null) {
            throw new JwtAuthenticationException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
        }
        
        var now = Instant.now();
        if (storedToken.getExpiresAt().isBefore(now)) {
            throw new JwtAuthenticationException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }
        
        String tokenHash;
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            var hashBytes = digest.digest(tokenString.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            tokenHash = bytesToHex(hashBytes);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
        
        if (!tokenHash.equals(storedToken.getTokenHash())) {
            throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_SIGNATURE);
        }
        
        return storedToken.getStaffAccount();
    }
    
    public UUID getUserIdFromToken(SignedJWT jwt) {
        try {
            String subject = jwt.getJWTClaimsSet().getSubject();
            return UUID.fromString(subject);
        } catch (ParseException e) {
            throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_FORMAT, e);
        }
    }
    
    @Transactional
    public void deleteRefreshToken(String refreshToken) {
        String[] parts = refreshToken.split(":", 2);
        if (parts.length != 2) {
            throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_FORMAT);
        }
        
        String tokenId = parts[0];
        if (refreshTokenRepository.existsById(tokenId)) {
            refreshTokenRepository.deleteById(tokenId);
        }
    }
}
