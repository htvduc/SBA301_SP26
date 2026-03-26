package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.entities.OrderStatus;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.services.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager/orders")
public class ManagerOrderController {

    private final OrderService orderService;

    public ManagerOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/{orderId}")
    public ApiResponse<OrderDTO> getOrderDetails(@PathVariable UUID orderId) {
        return ApiResponse.success(orderService.getOrderById(orderId));
    }

    @GetMapping("/search")
    public ApiResponse<Page<OrderSummaryDTO>> searchOrders(
            @RequestParam UUID branchId,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) java.time.Instant startDate,
            @RequestParam(required = false) java.time.Instant endDate,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(orderService.searchOrders(branchId, status, searchTerm, startDate, endDate, pageable));
    }

    @GetMapping("/history")
    public ApiResponse<List<OrderDTO>> getOrderHistory(@RequestParam UUID branchId) {
        return ApiResponse.success(orderService.getOrderHistory(branchId));
    }
}
