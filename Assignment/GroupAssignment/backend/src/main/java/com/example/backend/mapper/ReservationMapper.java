package com.example.backend.mapper;

import com.example.backend.dto.ReservationDTO;
import com.example.backend.dto.request.ReservationApprovalMailRequest;
import com.example.backend.dto.request.ReservationConfirmationMailRequest;
import com.example.backend.dto.request.ReservationNoShowMailRequest;
import com.example.backend.dto.request.ReservationRejectionMailRequest;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.Branch;
import com.example.backend.entities.Reservation;

public class ReservationMapper {

    public static ReservationDTO toDTO(Reservation reservation) {

        if (reservation == null) {
            return null;
        }

        ReservationDTO dto = new ReservationDTO();

        dto.setReservationId(reservation.getReservationId());

        if (reservation.getBranch() != null) {
            dto.setBranchId(reservation.getBranch().getBranchId());
            dto.setBranchAddress(reservation.getBranch().getAddress());
            if (reservation.getBranch().getRestaurant() != null) {
                dto.setBranchName(reservation.getBranch().getRestaurant().getName());
            }
        }

        if (reservation.getAreaTable() != null) {
            dto.setAreaTableId(reservation.getAreaTable().getAreaTableId());
            dto.setTableTag(reservation.getAreaTable().getTag());
            dto.setTableCapacity(reservation.getAreaTable().getCapacity());
        }

        dto.setStartTime(reservation.getStartTime());
        dto.setCustomerName(reservation.getCustomerName());
        dto.setCustomerPhone(reservation.getCustomerPhone());
        dto.setCustomerEmail(reservation.getCustomerEmail());
        dto.setGuestNumber(reservation.getGuestNumber());
        dto.setNote(reservation.getNote());
        dto.setStatus(reservation.getStatus());
        dto.setArrivalTime(reservation.getArrivalTime());
        dto.setCompletionTime(reservation.getCompletionTime());
        dto.setRejectionReason(reservation.getRejectionReason());
        dto.setCreatedAt(reservation.getCreatedAt());
        dto.setUpdatedAt(reservation.getUpdatedAt());

        if (reservation.getArrivalTime() != null && reservation.getCompletionTime() != null) {
            long durationMinutes = java.time.Duration.between(
                reservation.getArrivalTime(), 
                reservation.getCompletionTime()
            ).toMinutes();
            dto.setServiceDurationMinutes(durationMinutes);
        }

        return dto;
    }

    public static Reservation toEntity(ReservationDTO dto) {

        if (dto == null) {
            return null;
        }

        Reservation reservation = new Reservation();

        reservation.setReservationId(dto.getReservationId());
        reservation.setStartTime(dto.getStartTime());
        reservation.setCustomerName(dto.getCustomerName());
        reservation.setCustomerPhone(dto.getCustomerPhone());
        reservation.setCustomerEmail(dto.getCustomerEmail());
        reservation.setGuestNumber(dto.getGuestNumber());
        reservation.setNote(dto.getNote());
        reservation.setStatus(dto.getStatus());
        reservation.setArrivalTime(dto.getArrivalTime());
        reservation.setCompletionTime(dto.getCompletionTime());
        reservation.setRejectionReason(dto.getRejectionReason());

        return reservation;
    }
    public static ReservationConfirmationMailRequest toMailRequest(
            Reservation reservation) {

        AreaTable table  = reservation.getAreaTable();
        Branch branch = reservation.getBranch();

        return ReservationConfirmationMailRequest.builder()
                .restaurantName(branch.getRestaurant().getName())
                .mail(reservation.getCustomerEmail())
                .customerName(reservation.getCustomerName())
                .customerPhone(reservation.getCustomerPhone())
                .reservationId(reservation.getReservationId())
                .startTime(reservation.getStartTime())
                .guestNumber(reservation.getGuestNumber())
                .note(reservation.getNote())
                .branchAddress(branch.getAddress())
                .tableTag(table != null ? table.getTag() : null)
                .tableCapacity(table != null ? table.getCapacity() : null)
                .build();
    }

    public static ReservationApprovalMailRequest toApprovalMailRequest(
            Reservation reservation) {

        AreaTable table = reservation.getAreaTable();
        Branch branch = reservation.getBranch();

        return ReservationApprovalMailRequest.builder()
                .mail(reservation.getCustomerEmail())
                .customerName(reservation.getCustomerName())
                .restaurantName(branch.getRestaurant().getName())
                .reservationId(reservation.getReservationId())
                .startTime(reservation.getStartTime())
                .guestNumber(reservation.getGuestNumber())
                .branchAddress(branch.getAddress())
                .tableTag(table != null ? table.getTag() : null)
                .tableCapacity(table != null ? table.getCapacity() : null)
                .note(reservation.getNote())
                .build();
    }

    public static ReservationRejectionMailRequest toRejectionMailRequest(
            Reservation reservation, String reason) {

        Branch branch = reservation.getBranch();

        return ReservationRejectionMailRequest.builder()
                .mail(reservation.getCustomerEmail())
                .customerName(reservation.getCustomerName())
                .restaurantName(branch.getRestaurant().getName())
                .reservationId(reservation.getReservationId())
                .startTime(reservation.getStartTime())
                .reason(reason)
                .branchPhone(branch.getBranchPhone())
                .branchEmail(branch.getMail())
                .build();
    }

    public static ReservationNoShowMailRequest toNoShowMailRequest(
            Reservation reservation) {

        Branch branch = reservation.getBranch();

        return ReservationNoShowMailRequest.builder()
                .mail(reservation.getCustomerEmail())
                .customerName(reservation.getCustomerName())
                .restaurantName(branch.getRestaurant().getName())
                .reservationId(reservation.getReservationId())
                .startTime(reservation.getStartTime())
                .branchPhone(branch.getBranchPhone())
                .branchEmail(branch.getMail())
                .build();
    }
}
