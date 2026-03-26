package com.example.backend.controller;

import com.example.backend.dto.OrderLineDTO;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.services.OrderService;
import com.example.backend.entities.OrderLineStatus;
import com.example.backend.services.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager/order-lines")
public class ManagerOrderLineController {

    private final OrderService orderService;

    public ManagerOrderLineController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/current")
    public ApiResponse<List<OrderLineDTO>> getCurrentOrderLines(@RequestParam UUID branchId) {
        return ApiResponse.success(orderService.getCurrentOrderLines(branchId));
    }

    @GetMapping("/{orderLineId}")
    public ApiResponse<OrderLineDTO> getOrderLineDetails(@PathVariable UUID orderLineId) {
        return ApiResponse.success(orderService.getOrderLineById(orderLineId));
    }

    @PatchMapping("/{orderLineId}/status")
    public ApiResponse<OrderLineDTO> updateOrderLineStatus(
            @PathVariable UUID orderLineId,
            @RequestParam OrderLineStatus status) {
        return ApiResponse.success(orderService.updateOrderLineStatus(orderLineId, status));
    }
}
