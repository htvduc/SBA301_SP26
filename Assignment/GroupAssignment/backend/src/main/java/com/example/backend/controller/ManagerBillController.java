package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.entities.PaymentMethod;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.services.BillService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager/bills")
public class ManagerBillController {

    private final BillService billService;

    public ManagerBillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping("/{billId}")
    public ApiResponse<BillDTO> getBillDetails(@PathVariable UUID billId) {
        return ApiResponse.success(billService.getBillById(billId));
    }

    @GetMapping("/search")
    public ApiResponse<Page<BillSummaryDTO>> searchBills(
            @RequestParam UUID branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) String searchTerm,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(billService.searchBills(branchId, startDate, endDate, paymentMethod, searchTerm, pageable));
    }

    @GetMapping("/history")
    public ApiResponse<List<BillDTO>> getBillingHistory(
            @RequestParam UUID branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate) {
        return ApiResponse.success(billService.getBillingHistory(branchId, startDate, endDate));
    }
}
