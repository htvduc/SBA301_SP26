package com.example.backend.dto.request;

import java.util.UUID;
import com.example.backend.dto.RoleDTO;
import com.example.backend.entities.EntityStatus;
import com.example.backend.validator.Password;
import jakarta.validation.constraints.NotBlank;

public class CreateStaffAccountRequest {

    private String username;
    
    @NotBlank(message = "PASSWORD_REQUIRED")
    @Password(message = "INVALID_PASSWORD")
    private String password;
    private UUID branchId;
    private RoleDTO role;
    private EntityStatus status = EntityStatus.ACTIVE;

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public UUID getBranchId() {
        return branchId;
    }
    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }
    public RoleDTO getRole() {
        return role;
    }
    public void setRole(RoleDTO role) {
        this.role = role;
    }
    public EntityStatus getStatus() {
        return status;
    }
    public void setStatus(EntityStatus status) {
        this.status = status;
    }
}