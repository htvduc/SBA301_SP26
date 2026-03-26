package com.example.backend.services;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.UUID;

import com.example.backend.entities.Area;
import com.example.backend.entities.AreaTable;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repositories.AreaTableRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
public class QrCodeService {

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;
    private final AreaTableRepository areaTableRepository;

    public QrCodeService(AreaTableRepository areaTableRepository) {
        this.areaTableRepository = areaTableRepository;
    }

    /**
     * Generate QR code for a table
     * @param tableId UUID of the table
     * @return Base64 encoded QR code image
     */
    public String generateTableQrCode(UUID tableId) {
        try {
            AreaTable table = areaTableRepository.findById(tableId)
                    .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
            Area area = table.getArea();
            String publicUrl = area.getBranch().getRestaurant().getPublicUrl();
            
            // Extract slug from publicUrl (handle both full URL and slug-only cases)
            String slug;
            if (publicUrl.startsWith("http://") || publicUrl.startsWith("https://")) {
                // Extract slug from full URL (e.g., "https://bentox.store/khoine" -> "khoine")
                slug = publicUrl.substring(publicUrl.lastIndexOf('/') + 1);
            } else {
                // Already a slug
                slug = publicUrl;
            }
            
            // Create URL for the table
            String tableUrl = frontendBaseUrl + "/"+ slug +"/menu/" + tableId.toString();
            
            // Generate QR Code
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(tableUrl, BarcodeFormat.QR_CODE, 300, 300);
            
            // Convert to image
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            // Convert to Base64
            byte[] qrCodeBytes = outputStream.toByteArray();
            String base64QrCode = Base64.getEncoder().encodeToString(qrCodeBytes);
            
            return "data:image/png;base64," + base64QrCode;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    /**
     * Generate QR code with custom URL
     * @param url Custom URL to encode
     * @return Base64 encoded QR code image
     */
    public String generateQrCode(String url) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(url, BarcodeFormat.QR_CODE, 300, 300);
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            byte[] qrCodeBytes = outputStream.toByteArray();
            String base64QrCode = Base64.getEncoder().encodeToString(qrCodeBytes);
            
            return "data:image/png;base64," + base64QrCode;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
}
