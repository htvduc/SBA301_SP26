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

import com.example.backend.dto.AreaDTO;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.entities.EntityStatus;
import com.example.backend.services.AreaService;

@RestController
@RequestMapping("/api/areas")
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @GetMapping("")
    public ApiResponse<List<AreaDTO>> getAll() {
        ApiResponse<List<AreaDTO>> response = new ApiResponse<>();
        response.setResult(areaService.getAll());
        return response;
    }

    @GetMapping("/paginated")
    public ApiResponse<Page<AreaDTO>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        ApiResponse<Page<AreaDTO>> response = new ApiResponse<>();
        response.setResult(areaService.getAllPaginated(pageable));
        return response;
    }

    @GetMapping("/{id}")
    public ApiResponse<AreaDTO> getById(@PathVariable UUID id) {
        ApiResponse<AreaDTO> response = new ApiResponse<>();
        response.setResult(areaService.getById(id));
        return response;
    }

    @GetMapping("/branch/{branchId}")
    public ApiResponse<List<AreaDTO>> getByBranch(@PathVariable UUID branchId) {
        ApiResponse<List<AreaDTO>> response = new ApiResponse<>();
        response.setResult(areaService.getByBranch(branchId));
        return response;
    }

    @GetMapping("/branch/{branchId}/paginated")
    public ApiResponse<Page<AreaDTO>> getByBranchPaginated(
            @PathVariable UUID branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        ApiResponse<Page<AreaDTO>> response = new ApiResponse<>();
        response.setResult(areaService.getByBranchPaginated(branchId, pageable));
        return response;
    }

    @GetMapping("/branch/{branchId}/status/{status}")
    public ApiResponse<List<AreaDTO>> getByBranchAndStatus(
            @PathVariable UUID branchId,
            @PathVariable EntityStatus status) {
        ApiResponse<List<AreaDTO>> response = new ApiResponse<>();
        response.setResult(areaService.getByBranchAndStatus(branchId, status));
        return response;
    }

    @PostMapping("")
    public ApiResponse<AreaDTO> create(@RequestBody AreaDTO dto) {
        ApiResponse<AreaDTO> response = new ApiResponse<>();
        response.setResult(areaService.create(dto));
        return response;
    }

    @PutMapping("/{id}")
    public ApiResponse<AreaDTO> update(@PathVariable UUID id, @RequestBody AreaDTO dto) {
        ApiResponse<AreaDTO> response = new ApiResponse<>();
        response.setResult(areaService.update(id, dto));
        return response;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        areaService.delete(id);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Area deleted successfully");
        return response;
    }

    @PutMapping("/{id}/activate")
    public ApiResponse<AreaDTO> activate(@PathVariable UUID id) {
        ApiResponse<AreaDTO> response = new ApiResponse<>();
        response.setResult(areaService.activate(id));
        return response;
    }

    @PutMapping("/{id}/deactivate")
    public ApiResponse<AreaDTO> deactivate(@PathVariable UUID id) {
        ApiResponse<AreaDTO> response = new ApiResponse<>();
        response.setResult(areaService.deactivate(id));
        return response;
    }
}
