package com.example.backend.controller;

import com.example.backend.dto.BillDTO;
import com.example.backend.dto.request.ConfirmPaymentRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.services.BillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/waiter/bills")
public class WaiterBillController {

    private final BillService billService;

    public WaiterBillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping("/confirm")
    public ApiResponse<BillDTO> confirmPayment(@RequestBody ConfirmPaymentRequest request) {
        return ApiResponse.success(billService.confirmPayment(request));
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<BillDTO> getBillByOrder(@PathVariable UUID orderId) {
        return ApiResponse.success(billService.getBillByOrderId(orderId));
    }

    @GetMapping("/branch/{branchId}")
    public ApiResponse<List<BillDTO>> getBillsByBranch(@PathVariable UUID branchId) {
        return ApiResponse.success(billService.getBillsByBranch(branchId));
    }
}
