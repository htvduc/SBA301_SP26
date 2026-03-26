package com.example.backend.controller;

import com.example.backend.dto.AreaTableDTO;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.entities.TableStatus;
import com.example.backend.services.AreaTableService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/waiter/tables")
public class WaiterTableController {

    private final AreaTableService areaTableService;

    public WaiterTableController(AreaTableService areaTableService) {
        this.areaTableService = areaTableService;
    }

    @PutMapping("/{id}/status")
    public ApiResponse<AreaTableDTO> setStatus(@PathVariable UUID id,
                                               @RequestParam TableStatus status) {
        return ApiResponse.success(areaTableService.setStatusByStaff(id, status));
    }
}
