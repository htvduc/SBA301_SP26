package com.example.backend.controller;

import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.OrderHistorySummaryDTO;
import com.example.backend.dto.request.AddItemsToOrderRequest;
import com.example.backend.dto.request.CreateOrderRequest;
import com.example.backend.dto.request.UpdateOrderItemRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.services.BillService;
import com.example.backend.services.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/waiter/orders")
public class WaiterOrderController {

    private final OrderService orderService;
    private final BillService billService;

    public WaiterOrderController(OrderService orderService, BillService billService) {
        this.orderService = orderService;
        this.billService = billService;
    }

    @PostMapping
    public ApiResponse<OrderDTO> createOrder(@RequestBody CreateOrderRequest request) {
        return ApiResponse.success(orderService.createOrder(request));
    }

    @PostMapping("/{orderId}/items")
    public ApiResponse<OrderDTO> addItems(@PathVariable UUID orderId,
                                          @RequestBody AddItemsToOrderRequest request) {
        return ApiResponse.success(orderService.addItemsToOrder(orderId, request));
    }

    @GetMapping("/{orderId}")
    public ApiResponse<OrderDTO> getOrder(@PathVariable UUID orderId) {
        return ApiResponse.success(orderService.getOrderById(orderId));
    }

    @GetMapping("/table/{tableId}/active")
    public ApiResponse<OrderDTO> getActiveOrderByTable(@PathVariable UUID tableId) {
        return ApiResponse.success(orderService.getActiveOrderByTable(tableId));
    }

    @GetMapping("/branch/{branchId}/history")
    public ApiResponse<List<OrderHistorySummaryDTO>> getOrderHistory(@PathVariable UUID branchId) {
        return ApiResponse.success(orderService.getOrderHistorySummaries(branchId));
    }

    @GetMapping("/branch/{branchId}")
    public ApiResponse<List<OrderDTO>> getOrdersByBranch(@PathVariable UUID branchId) {
        return ApiResponse.success(orderService.getOrdersByBranch(branchId));
    }

    @GetMapping("/branch/{branchId}/active")
    public ApiResponse<List<OrderDTO>> getActiveOrdersByBranch(@PathVariable UUID branchId) {
        return ApiResponse.success(orderService.getActiveOrdersByBranch(branchId));
    }

    @PutMapping("/items/{orderItemId}")
    public ApiResponse<OrderDTO> updateOrderItem(@PathVariable UUID orderItemId,
                                                 @RequestBody UpdateOrderItemRequest request) {
        return ApiResponse.success(orderService.updateOrderItem(orderItemId, request));
    }

    @DeleteMapping("/items/{orderItemId}")
    public ApiResponse<OrderDTO> removeOrderItem(@PathVariable UUID orderItemId) {
        return ApiResponse.success(orderService.removeOrderItem(orderItemId));
    }

    @PutMapping("/{orderId}/cancel")
    public ApiResponse<OrderDTO> cancelOrder(@PathVariable UUID orderId) {
        return ApiResponse.success(orderService.cancelOrder(orderId));
    }

    @GetMapping("/branch/{branchId}/today-count")
    public ApiResponse<Long> getTodayOrdersCount(@PathVariable UUID branchId) {
        return ApiResponse.success(billService.getTodayBillsCount(branchId));
    }
}
