package com.example.backend.dto;

import com.example.backend.entities.RoleName;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class RoleDTO {
    private RoleName name;
    private String description;
}