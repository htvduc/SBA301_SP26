package com.example.backend.controller;

import com.example.backend.dto.AdminStatisticsDTO;
import com.example.backend.dto.PackageStatsDTO;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.PackageFeatureDTO;
import com.example.backend.services.AdminStatisticsService;
import com.example.backend.services.PackageFeatureService;
import com.example.backend.services.PackageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/packages")
public class PackageController {
    private final PackageService packageService;
    private final PackageFeatureService packageFeatureService;
    private final AdminStatisticsService adminStatisticsService;

    public PackageController(PackageService packageService,
                             PackageFeatureService packageFeatureService,
                             AdminStatisticsService adminStatisticsService) {
        this.packageService = packageService;
        this.packageFeatureService = packageFeatureService;
        this.adminStatisticsService = adminStatisticsService;
    }

    @GetMapping("")
    public ApiResponse<List<PackageFeatureDTO>> getAllPackages() {
        ApiResponse<List<PackageFeatureDTO>> response = new ApiResponse<>();
        response.setResult(packageFeatureService.getAllPackagesWithFeatures());
        return response;
    }

    @GetMapping("/active")
    public ApiResponse<List<PackageFeatureDTO>> getActivePackages() {
        ApiResponse<List<PackageFeatureDTO>> response = new ApiResponse<>();
        response.setResult(packageFeatureService.getActivePackagesWithFeatures());
        return response;
    }

    @GetMapping("/{packageId}")
    public ApiResponse<PackageFeatureDTO> getPackage(@PathVariable UUID packageId) {
        ApiResponse<PackageFeatureDTO> response = new ApiResponse<>();
        response.setResult(packageFeatureService.getPackageWithFeatures(packageId));
        return response;
    }

    @PostMapping("")
    public ApiResponse<PackageFeatureDTO> createPackage(@RequestBody PackageFeatureDTO dto) {
        ApiResponse<PackageFeatureDTO> response = new ApiResponse<>();
        PackageFeatureDTO savedPkg = packageService.createPackageWithFeatures(dto);
        response.setResult(savedPkg);
        return response;
    }

    @PutMapping("/{packageId}")
    public ApiResponse<PackageFeatureDTO> updatePackage(@PathVariable UUID packageId,
                                                        @RequestBody PackageFeatureDTO dto) {
        ApiResponse<PackageFeatureDTO> response = new ApiResponse<>();
        PackageFeatureDTO updatedPkg = packageService.updatePackageWithFeatures(packageId, dto);
        response.setResult(updatedPkg);
        return response;
    }

    @DeleteMapping("/{packageId}/features/{featureId}")
    public ApiResponse<Void> deleteFeatureFromPackage(@PathVariable UUID packageId,
                                                      @PathVariable UUID featureId) {
        ApiResponse<Void> response = new ApiResponse<>();
        packageFeatureService.deleteFeatureFromPackage(packageId, featureId);
        response.setResult(null);
        return response;
    }

    @PutMapping("/{packageId}/deactivate")
    public ApiResponse<Void> deactivatePackage(@PathVariable UUID packageId) {
        ApiResponse<Void> response = new ApiResponse<>();
        packageService.deactivatePackage(packageId);
        response.setResult(null);
        return response;
    }

    @PutMapping("/{packageId}/activate")
    public ApiResponse<Void> activatePackage(@PathVariable UUID packageId) {
        ApiResponse<Void> response = new ApiResponse<>();
        packageService.activatePackage(packageId);
        response.setResult(null);
        return response;
    }

    @GetMapping("/statistics")
    public ApiResponse<AdminStatisticsDTO> getAdminStatistics() {
        ApiResponse<AdminStatisticsDTO> response = new ApiResponse<>();
        response.setResult(adminStatisticsService.getAdminStatistics());
        return response;
    }

    @GetMapping("/statistics/date-range")
    public ApiResponse<AdminStatisticsDTO> getAdminStatisticsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ApiResponse<AdminStatisticsDTO> response = new ApiResponse<>();
        response.setResult(adminStatisticsService.getAdminStatisticsByDateRange(startDate, endDate));
        return response;
    }

    @GetMapping("/statistics/package-stats")
    public ApiResponse<List<PackageStatsDTO>> getPackageStatsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ApiResponse<List<PackageStatsDTO>> response = new ApiResponse<>();
        response.setResult(adminStatisticsService.getPackageStatsByDateRange(startDate, endDate));
        return response;
    }
}

