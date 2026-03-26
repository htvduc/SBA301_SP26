package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.StaffAccountDTO;
import com.example.backend.dto.request.CreateStaffAccountRequest;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.entities.RoleName;
import com.example.backend.services.StaffAccountService;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff")
public class StaffAccountController {

    private final StaffAccountService staffAccountService;

    public StaffAccountController(StaffAccountService staffAccountService) {
        this.staffAccountService = staffAccountService;
    }

    // ==========================================
    // 1. ENDPOINT DÙNG CHUNG (OWNER & MANAGER)
    // ==========================================

    // Lấy chi tiết một tài khoản nhân viên
    @GetMapping("/{staffAccountId}")
    public ApiResponse<StaffAccountDTO> getStaffAccountById(@PathVariable UUID staffAccountId) {
        ApiResponse<StaffAccountDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.getStaffAccountById(staffAccountId));
        return apiResponse;
    }

    // Tạo mới tài khoản nhân viên
    @PostMapping("")
    public ApiResponse<StaffAccountDTO> createStaffAccount(@Valid @RequestBody CreateStaffAccountRequest request) {
        ApiResponse<StaffAccountDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.createStaffAccount(request));
        return apiResponse;
    }

    // Cập nhật thông tin tài khoản nhân viên
    @PutMapping("")
    public ApiResponse<StaffAccountDTO> updateStaffAccount(@RequestBody StaffAccountDTO staffAccountDTO) {
        ApiResponse<StaffAccountDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.updateStaffAccount(staffAccountDTO));
        return apiResponse;
    }

    // Thay đổi trạng thái tài khoản (Kích hoạt / Vô hiệu hóa - Soft Delete)
    @DeleteMapping("/{staffAccountId}")
    public ApiResponse<StaffAccountDTO> setStaffAccountStatus(@PathVariable UUID staffAccountId) {
        ApiResponse<StaffAccountDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.setStaffAccountStatus(staffAccountId));
        return apiResponse;
    }

    // ==========================================
    // 2. ENDPOINT CỦA CHỦ NHÀ HÀNG (OWNER)
    // ==========================================

    // Xem danh sách nhân viên trong một chi nhánh (Dành cho Owner - bao gồm cả Manager)
    @GetMapping("/owner/paginated")
    public ApiResponse<PageResponse<StaffAccountDTO>> getStaffByBranchForOwner(
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String roleFilter,
            @RequestParam(required = false) Boolean isActive) {
        ApiResponse<PageResponse<StaffAccountDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.getStaffAccountByBranchForOwnerPaginated(page, size, branchId, keyword, roleFilter, isActive));
        return apiResponse;
    }


    // ==========================================
    // 3. ENDPOINT CỦA QUẢN LÝ CHI NHÁNH (MANAGER)
    // ==========================================

    // Xem danh sách nhân viên trong chi nhánh (Loại bỏ chính Manager)
    @GetMapping("/manager/paginated")
    public ApiResponse<PageResponse<StaffAccountDTO>> getStaffByBranch(
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String roleFilter,
            @RequestParam(required = false) Boolean isActive) {
        ApiResponse<PageResponse<StaffAccountDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.getStaffAccountPaginated(page, size, branchId, keyword, roleFilter, isActive));
        return apiResponse;
    }

    // Các API Thống kê số lượng nhân viên trong chi nhánh
    @GetMapping("/manager/statistic/{branchId}")
    public ApiResponse<com.example.backend.dto.StaffStatisticDTO> getBranchStaffStatistic(@PathVariable UUID branchId) {
        long waiters = staffAccountService.getRoleNumber(branchId, RoleName.WAITER);
        long receptionists = staffAccountService.getRoleNumber(branchId, RoleName.RECEPTIONIST);

        ApiResponse<com.example.backend.dto.StaffStatisticDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(new com.example.backend.dto.StaffStatisticDTO(waiters, receptionists));
        return apiResponse;
    }

    // Đặt lại mật khẩu tài khoản nhân viên (dùng bởi Owner hoặc Manager)
    @PatchMapping("/{staffAccountId}/password")
    public ApiResponse<Void> resetStaffPassword(
            @PathVariable UUID staffAccountId,
            @RequestBody java.util.Map<String, String> body) {
        String newPassword = body.get("newPassword");
        staffAccountService.resetStaffPassword(staffAccountId, newPassword);
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        return apiResponse;
    }

    // Chuyển nhân viên sang chi nhánh khác (chỉ Owner)
    @PatchMapping("/{staffAccountId}/transfer")
    public ApiResponse<StaffAccountDTO> transferStaffToBranch(
            @PathVariable UUID staffAccountId,
            @RequestBody java.util.Map<String, String> body) {
        UUID newBranchId = UUID.fromString(body.get("newBranchId"));
        ApiResponse<StaffAccountDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.transferStaffToBranch(staffAccountId, newBranchId));
        return apiResponse;
    }
}
