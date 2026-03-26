package com.example.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ReservationAnalyticsDTO;
import com.example.backend.dto.ReservationDTO;
import com.example.backend.dto.TableAvailabilityDTO;
import com.example.backend.dto.request.RejectReservationRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.entities.ReservationStatus;
import com.example.backend.services.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ApiResponse<List<ReservationDTO>> getAll() {
        ApiResponse<List<ReservationDTO>> res = new ApiResponse<>();
        res.setResult(reservationService.getAll());
        return res;
    }

    @GetMapping("/{id}")
    public ApiResponse<ReservationDTO> getById(@PathVariable UUID id) {
        ApiResponse<ReservationDTO> res = new ApiResponse<>();
        res.setResult(reservationService.getById(id));
        return res;
    }

    @GetMapping("/branch/{branchId}")
    public ApiResponse<List<ReservationDTO>> getByBranch(@PathVariable UUID branchId) {
        ApiResponse<List<ReservationDTO>> res = new ApiResponse<>();
        res.setResult(reservationService.getByBranch(branchId));
        return res;
    }

    @GetMapping("/table/{tableId}")
    public ApiResponse<List<ReservationDTO>> getByTable(@PathVariable UUID tableId) {
        ApiResponse<List<ReservationDTO>> res = new ApiResponse<>();
        res.setResult(reservationService.getByTable(tableId));
        return res;
    }

    @PostMapping
    public ApiResponse<ReservationDTO> create(@RequestBody ReservationDTO dto) {
        ApiResponse<ReservationDTO> res = new ApiResponse<>();
        res.setResult(reservationService.create(dto));
        return res;
    }

    @PostMapping("/staff")
    public ApiResponse<ReservationDTO> createByStaff(@RequestBody ReservationDTO dto) {
        ApiResponse<ReservationDTO> res = new ApiResponse<>();
        res.setResult(reservationService.createByStaff(dto));
        return res;
    }

    @PutMapping("/{id}")
    public ApiResponse<ReservationDTO> update(
            @PathVariable UUID id,
            @RequestBody ReservationDTO dto) {

        ApiResponse<ReservationDTO> res = new ApiResponse<>();
        res.setResult(reservationService.update(id, dto));
        return res;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        reservationService.delete(id);
        return new ApiResponse<>();
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<ReservationDTO> approve(@PathVariable UUID id) {
        ApiResponse<ReservationDTO> res = new ApiResponse<>();
        res.setResult(reservationService.approve(id));
        return res;
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<ReservationDTO> reject(
            @PathVariable UUID id,
            @RequestBody RejectReservationRequest request) {
        ApiResponse<ReservationDTO> res = new ApiResponse<>();
        res.setResult(reservationService.reject(id, request.getReason()));
        return res;
    }

    @PostMapping("/{id}/arrive")
    public ApiResponse<ReservationDTO> markArrived(@PathVariable UUID id) {
        ApiResponse<ReservationDTO> res = new ApiResponse<>();
        res.setResult(reservationService.markArrived(id));
        return res;
    }

    @PostMapping("/{id}/complete")
    public ApiResponse<ReservationDTO> complete(@PathVariable UUID id) {
        ApiResponse<ReservationDTO> res = new ApiResponse<>();
        res.setResult(reservationService.complete(id));
        return res;
    }

    @PostMapping("/{id}/no-show")
    public ApiResponse<ReservationDTO> markNoShow(@PathVariable UUID id) {
        ApiResponse<ReservationDTO> res = new ApiResponse<>();
        res.setResult(reservationService.markNoShow(id));
        return res;
    }

    @GetMapping("/branch/{branchId}/filter")
    public ApiResponse<List<ReservationDTO>> filterReservations(
            @PathVariable UUID branchId,
            @RequestParam(required = false) List<ReservationStatus> statuses,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String search) {
        ApiResponse<List<ReservationDTO>> res = new ApiResponse<>();
        res.setResult(reservationService.filterReservations(branchId, statuses, startDate, endDate, search));
        return res;
    }

    @GetMapping("/branch/{branchId}/analytics")
    public ApiResponse<ReservationAnalyticsDTO> getAnalytics(
            @PathVariable UUID branchId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        ApiResponse<ReservationAnalyticsDTO> res = new ApiResponse<>();
        res.setResult(reservationService.getAnalytics(branchId, startDate, endDate));
        return res;
    }

    @GetMapping("/branch/{branchId}/available-tables")
    public ApiResponse<List<TableAvailabilityDTO>> getAvailableTables(
            @PathVariable UUID branchId,
            @RequestParam LocalDateTime time,
            @RequestParam int guests,
            @RequestParam(required = false) Integer duration) {
        ApiResponse<List<TableAvailabilityDTO>> res = new ApiResponse<>();
        res.setResult(reservationService.getAvailableTables(branchId, time, guests, duration));
        return res;
    }
}
