package com.example.backend.dto.response;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffAuthResponse {
    private String accessToken;
    private String refreshToken;
    private StaffInfo staffInfo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StaffInfo {
        private UUID staffAccountId;
        private String username;
        private String role;
        private UUID branchId;
        private UUID restaurantId;
    }
}