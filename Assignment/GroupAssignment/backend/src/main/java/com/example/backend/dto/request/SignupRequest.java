package com.example.backend.dto.request;

import com.example.backend.validator.Password;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {
    @Email
    private String email;
    @Password
    private String password;
    @Size(min = 5, max = 25, message = "username's length must be between 5 and 25")
    private String username;
}
