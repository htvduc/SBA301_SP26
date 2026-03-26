package com.example.backend.dto.request;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.Email;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OTPMailRequest {
    @Email
    private String mail;
    private String name;
}
