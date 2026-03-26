package com.example.backend.security;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.JwtService;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final com.example.backend.repositories.StaffAccountRepository staffAccountRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip JWT filter for OAuth2 endpoints and public auth endpoints only
        return path.startsWith("/oauth2/")
            || path.startsWith("/login/oauth2/")
                || path.equals("/api/auth/login")
            || path.equals("/api/auth/staff-login")
            || path.equals("/api/auth/refresh")
            || path.equals("/api/auth/staff-refresh")
            || path.equals("/api/auth/logout");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String token = extractTokenFromRequest(request);

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                SignedJWT jwt = jwtService.validateAccessToken(token);
                UUID userId = jwtService.getUserIdFromToken(jwt);

                Object userTypeClaim = jwt.getJWTClaimsSet().getClaim("userType");
                if (userTypeClaim != null && "STAFF".equals(userTypeClaim.toString())) {
                    com.example.backend.entities.StaffAccount staff = staffAccountRepository.findByIdWithRole(userId).orElse(null);
                    if (staff != null) {
                        String role = jwt.getJWTClaimsSet().getClaim("role").toString();
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                staff,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } else {
                    User user = userRepository.findByIdWithRole(userId).orElse(null);

                    if (user != null) {
                        String role = jwt.getJWTClaimsSet().getClaim("role").toString();

                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                Collections.singletonList(
                                        new SimpleGrantedAuthority("ROLE_" + role)));

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource()
                                        .buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }

            } catch (Exception e) {
                // ❗ KHÔNG trả lỗi ở đây
                // Chỉ log thôi
                log.warn("Invalid JWT: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        // First, try to get token from Authorization header (for API clients)
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")){
            return bearerToken.substring(7);
        }

        // Second, try to get token from HttpOnly cookie (for browser clients)
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("access_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }
}
