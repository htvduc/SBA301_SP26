package com.example.backend.dto;

import java.util.UUID;
import com.example.backend.entities.EntityStatus;

public class StaffAccountDTO {

    private UUID staffAccountId;
    private RoleDTO role;
    private String username;
    private EntityStatus status;
    private UUID branchId;

    public UUID getStaffAccountId() {
        return staffAccountId;
    }
    public void setStaffAccountId(UUID staffAccountId) {
        this.staffAccountId = staffAccountId;
    }
    public RoleDTO getRole() {
        return role;
    }
    public void setRole(RoleDTO role) {
        this.role = role;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }

    public EntityStatus getStatus() {
        return status;
    }
    public void setStatus(EntityStatus status) {
        this.status = status;
    }
    public UUID getBranchId() {
        return branchId;
    }
    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }
}