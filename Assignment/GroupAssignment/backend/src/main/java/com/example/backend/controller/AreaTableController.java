package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.AreaTableDTO;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.entities.TableStatus;
import com.example.backend.services.AreaTableService;

@RestController
@RequestMapping("/api/tables")
public class AreaTableController {

    private final AreaTableService areaTableService;

    public AreaTableController(AreaTableService areaTableService) {
        this.areaTableService = areaTableService;
    }

    @GetMapping("")
    public ApiResponse<List<AreaTableDTO>> getAll() {
        ApiResponse<List<AreaTableDTO>> response = new ApiResponse<>();
        response.setResult(areaTableService.getAll());
        return response;
    }

    @GetMapping("/paginated")
    public ApiResponse<Page<AreaTableDTO>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        ApiResponse<Page<AreaTableDTO>> response = new ApiResponse<>();
        response.setResult(areaTableService.getAllPaginated(pageable));
        return response;
    }

    @GetMapping("/{id}")
    public ApiResponse<AreaTableDTO> getById(@PathVariable UUID id) {
        ApiResponse<AreaTableDTO> response = new ApiResponse<>();
        response.setResult(areaTableService.getById(id));
        return response;
    }

    @GetMapping("/area/{areaId}")
    public ApiResponse<List<AreaTableDTO>> getByArea(@PathVariable UUID areaId) {
        ApiResponse<List<AreaTableDTO>> response = new ApiResponse<>();
        response.setResult(areaTableService.getByArea(areaId));
        return response;
    }

    @GetMapping("/area/{areaId}/paginated")
    public ApiResponse<Page<AreaTableDTO>> getByAreaPaginated(
            @PathVariable UUID areaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "tag") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        ApiResponse<Page<AreaTableDTO>> response = new ApiResponse<>();
        response.setResult(areaTableService.getByAreaPaginated(areaId, pageable));
        return response;
    }

    @GetMapping("/branch/{branchId}")
    public ApiResponse<List<AreaTableDTO>> getByBranch(@PathVariable UUID branchId) {
        ApiResponse<List<AreaTableDTO>> response = new ApiResponse<>();
        response.setResult(areaTableService.getByBranch(branchId));
        return response;
    }

    @GetMapping("/branch/{branchId}/paginated")
    public ApiResponse<Page<AreaTableDTO>> getByBranchPaginated(
            @PathVariable UUID branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "tag") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        ApiResponse<Page<AreaTableDTO>> response = new ApiResponse<>();
        response.setResult(areaTableService.getByBranchPaginated(branchId, pageable));
        return response;
    }

    @GetMapping("/area/{areaId}/status/{status}")
    public ApiResponse<List<AreaTableDTO>> getByAreaAndStatus(
            @PathVariable UUID areaId,
            @PathVariable TableStatus status) {
        ApiResponse<List<AreaTableDTO>> response = new ApiResponse<>();
        response.setResult(areaTableService.getByAreaAndStatus(areaId, status));
        return response;
    }

    @PostMapping("")
    public ApiResponse<AreaTableDTO> create(@RequestBody AreaTableDTO dto) {
        ApiResponse<AreaTableDTO> response = new ApiResponse<>();
        response.setResult(areaTableService.create(dto));
        return response;
    }

    @PutMapping("/{id}")
    public ApiResponse<AreaTableDTO> update(@PathVariable UUID id, @RequestBody AreaTableDTO dto) {
        ApiResponse<AreaTableDTO> response = new ApiResponse<>();
        response.setResult(areaTableService.update(id, dto));
        return response;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        areaTableService.delete(id);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Table deleted successfully");
        return response;
    }

    @PutMapping("/{id}/status")
    public ApiResponse<AreaTableDTO> setStatus(
            @PathVariable UUID id,
            @RequestParam TableStatus status) {
        ApiResponse<AreaTableDTO> response = new ApiResponse<>();
        response.setResult(areaTableService.setStatus(id, status));
        return response;
    }

    @PutMapping("/{id}/out-of-order")
    public ApiResponse<AreaTableDTO> markOutOfOrder(@PathVariable UUID id) {
        ApiResponse<AreaTableDTO> response = new ApiResponse<>();
        response.setResult(areaTableService.markOutOfOrder(id));
        return response;
    }

    @PutMapping("/{id}/available")
    public ApiResponse<AreaTableDTO> markAvailable(@PathVariable UUID id) {
        ApiResponse<AreaTableDTO> response = new ApiResponse<>();
        response.setResult(areaTableService.markAvailable(id));
        return response;
    }

    @PutMapping("/{id}/occupied")
    public ApiResponse<AreaTableDTO> markOccupied(@PathVariable UUID id) {
        ApiResponse<AreaTableDTO> response = new ApiResponse<>();
        response.setResult(areaTableService.markOccupied(id));
        return response;
    }

    @GetMapping("/qr")
    public ApiResponse<AreaTableDTO> getByQrCode(@RequestParam String qrCode) {
        ApiResponse<AreaTableDTO> response = new ApiResponse<>();
        response.setResult(areaTableService.getByQrCode(qrCode));
        return response;
    }
}
