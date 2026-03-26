package com.example.backend.dto;

import java.util.UUID;
import com.example.backend.entities.EntityStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    private UUID userId;
    
    @Email
    private String email;
    
    @Size(min = 5, max = 25, message = "username's length must be between 5 and 25")    
    private String username;
    
    private RoleDTO role;
    
    private EntityStatus status;
}
