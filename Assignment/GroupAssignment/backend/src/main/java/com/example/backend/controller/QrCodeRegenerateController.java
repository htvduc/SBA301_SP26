package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.entities.AreaTable;
import com.example.backend.repositories.AreaTableRepository;
import com.example.backend.services.QrCodeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/qr-regenerate")
public class QrCodeRegenerateController {

    private final AreaTableRepository areaTableRepository;
    private final QrCodeService qrCodeService;

    public QrCodeRegenerateController(AreaTableRepository areaTableRepository, 
                                     QrCodeService qrCodeService) {
        this.areaTableRepository = areaTableRepository;
        this.qrCodeService = qrCodeService;
    }

    @PostMapping("/all")
    public ApiResponse<String> regenerateAllQrCodes() {
        List<AreaTable> tables = areaTableRepository.findAll();
        int count = 0;
        
        for (AreaTable table : tables) {
            try {
                String newQrCode = qrCodeService.generateTableQrCode(table.getAreaTableId());
                table.setQr(newQrCode);
                areaTableRepository.save(table);
                count++;
            } catch (Exception e) {
                // Log error but continue
                System.err.println("Failed to regenerate QR for table: " + table.getAreaTableId());
            }
        }
        
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Successfully regenerated " + count + " QR codes out of " + tables.size() + " tables");
        return response;
    }

    @PostMapping("/table/{tableId}")
    public ApiResponse<String> regenerateTableQrCode(@PathVariable UUID tableId) {
        AreaTable table = areaTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));
        
        String newQrCode = qrCodeService.generateTableQrCode(tableId);
        table.setQr(newQrCode);
        areaTableRepository.save(table);
        
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("QR code regenerated successfully for table: " + tableId);
        return response;
    }
}
