package com.example.backend.dto.request;

import com.example.backend.entities.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AIConsultantRequest {
    @NotBlank
    private String question;
    
    @NotNull
    private ReportType timeframe;
    
    private String sessionId;
    
    private LocalDate specificDate;
}
