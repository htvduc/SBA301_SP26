package com.example.backend.services;

import com.example.backend.dto.ReservationAnalyticsDTO;
import com.example.backend.dto.ReservationDTO;
import com.example.backend.dto.ReservationNotificationDTO;
import com.example.backend.dto.TableAvailabilityDTO;
import com.example.backend.dto.request.ReservationApprovalMailRequest;
import com.example.backend.dto.request.ReservationConfirmationMailRequest;
import com.example.backend.dto.request.ReservationNoShowMailRequest;
import com.example.backend.dto.request.ReservationRejectionMailRequest;
import com.example.backend.entities.Reservation;
import com.example.backend.entities.Branch;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.ReservationStatus;
import com.example.backend.entities.TableStatus;
import com.example.backend.exception.InvalidStatusTransitionException;
import com.example.backend.mapper.ReservationMapper;
import com.example.backend.repositories.ReservationRepository;
import com.example.backend.repositories.BranchRepository;
import com.example.backend.repositories.AreaTableRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private static final int DEFAULT_DURATION = 120; // 2 hours
    private static final int BUFFER_MINUTES = 15;
    private static final int RISKY_GAP_MINUTES = 30;

    private final ReservationRepository reservationRepository;
    private final BranchRepository branchRepository;
    private final AreaTableRepository areaTableRepository;
    private final MailService mailService;
    private final AreaTableService areaTableService;
    private final NotificationService notificationService;

    public List<ReservationDTO> getAll() {
        return reservationRepository.findAll()
                .stream()
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }


    public ReservationDTO getById(UUID id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        return ReservationMapper.toDTO(reservation);
    }


    public List<ReservationDTO> getByBranch(UUID branchId) {
        return reservationRepository.findByBranch_BranchId(branchId)
                .stream()
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }


    public List<ReservationDTO> getByTable(UUID tableId) {
        return reservationRepository.findByAreaTable_AreaTableId(tableId)
                .stream()
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }


    public ReservationDTO create(ReservationDTO dto) {

        if (dto.getStartTime() != null && dto.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("START_TIME_MUST_BE_IN_FUTURE");
        }

        if (dto.getGuestNumber() <= 0) {
            throw new IllegalArgumentException("GUEST_NUMBER_MUST_BE_POSITIVE");
        }

        Branch branch = branchRepository.findById(dto.getBranchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        AreaTable table = null;

        if (dto.getAreaTableId() != null) {
            table = areaTableRepository.findById(dto.getAreaTableId())
                    .orElseThrow(() -> new RuntimeException("Table not found"));
            
            // Validate table availability using time-based logic
            boolean conflict = hasTableConflict(dto.getBranchId(), dto.getAreaTableId(), 
                    dto.getStartTime(), dto.getEstimatedDurationMinutes());
            if (conflict) {
                throw new RuntimeException("TABLE_NOT_AVAILABLE");
            }
        }

        Reservation reservation = ReservationMapper.toEntity(dto);

        reservation.setBranch(branch);
        reservation.setAreaTable(table);
        // Set default duration if not provided
        if (reservation.getEstimatedDurationMinutes() == null) {
            reservation.setEstimatedDurationMinutes(DEFAULT_DURATION);
        }
        // Customer reservations start as PENDING and need receptionist approval
        reservation.setStatus(ReservationStatus.PENDING);
        reservation = reservationRepository.save(reservation);
        
        // Send confirmation email to customer about pending reservation
        if (reservation.getCustomerEmail() != null
                && !reservation.getCustomerEmail().isBlank()) {
            ReservationConfirmationMailRequest mailRequest =
                    ReservationMapper.toMailRequest(reservation);
            mailService.sendReservationConfirmationMail(mailRequest);
        }
        
        // Emit real-time notification for new reservation
        try {
            // Generate unique eventId
            String eventId = UUID.randomUUID().toString();
            
            // Extract branchId
            UUID branchId = reservation.getBranch().getBranchId();
            
            // Build ReservationNotificationDTO
            ReservationNotificationDTO notificationDTO = new ReservationNotificationDTO(
                eventId,
                reservation.getReservationId(),
                branchId,
                reservation.getCustomerName(),
                reservation.getCustomerPhone(),
                reservation.getCustomerEmail(),
                reservation.getStartTime(),
                reservation.getGuestNumber(),
                table != null ? table.getTag() : null,
                Instant.now()
            );
            
            // Emit notification
            notificationService.emitReservationNotification(branchId, notificationDTO);
        } catch (Exception e) {
            // Log error but don't fail reservation creation
            log.error("Failed to emit reservation notification for reservation {}: {}", 
                reservation.getReservationId(), e.getMessage(), e);
        }
        
        return ReservationMapper.toDTO(reservation);
    }

    public ReservationDTO createByStaff(ReservationDTO dto) {

        if (dto.getStartTime() != null && dto.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("START_TIME_MUST_BE_IN_FUTURE");
        }

        if (dto.getGuestNumber() <= 0) {
            throw new IllegalArgumentException("GUEST_NUMBER_MUST_BE_POSITIVE");
        }

        Branch branch = branchRepository.findById(dto.getBranchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        AreaTable table = null;

        if (dto.getAreaTableId() != null) {
            table = areaTableRepository.findById(dto.getAreaTableId())
                    .orElseThrow(() -> new RuntimeException("Table not found"));
            
            // Validate table availability using time-based logic
            boolean conflict = hasTableConflict(dto.getBranchId(), dto.getAreaTableId(), 
                    dto.getStartTime(), dto.getEstimatedDurationMinutes());
            if (conflict) {
                throw new RuntimeException("TABLE_NOT_AVAILABLE");
            }
        }

        Reservation reservation = ReservationMapper.toEntity(dto);

        reservation.setBranch(branch);
        reservation.setAreaTable(table);
        // Set default duration if not provided
        if (reservation.getEstimatedDurationMinutes() == null) {
            reservation.setEstimatedDurationMinutes(DEFAULT_DURATION);
        }
        // Staff-created reservations are auto-approved
        reservation.setStatus(ReservationStatus.APPROVED);
        reservation = reservationRepository.save(reservation);
        
        // Send approval email to customer
        if (reservation.getCustomerEmail() != null
                && !reservation.getCustomerEmail().isBlank()) {
            ReservationApprovalMailRequest mailRequest =
                    ReservationMapper.toApprovalMailRequest(reservation);
            mailService.sendReservationApprovalMail(mailRequest);
        }
        
        return ReservationMapper.toDTO(reservation);
    }


    public ReservationDTO update(UUID id, ReservationDTO dto) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setCustomerName(dto.getCustomerName());
        reservation.setCustomerPhone(dto.getCustomerPhone());
        reservation.setCustomerEmail(dto.getCustomerEmail());
        reservation.setGuestNumber(dto.getGuestNumber());
        reservation.setStartTime(dto.getStartTime());
        reservation.setNote(dto.getNote());
        reservation.setStatus(dto.getStatus());

        reservation = reservationRepository.save(reservation);

        return ReservationMapper.toDTO(reservation);
    }


    public void delete(UUID id) {
        reservationRepository.deleteById(id);
    }

    private void validateStatusTransition(ReservationStatus current, ReservationStatus target) {
        List<ReservationStatus> allowedTransitions;
        
        switch (current) {
            case PENDING:
                allowedTransitions = Arrays.asList(ReservationStatus.APPROVED, ReservationStatus.CANCELLED);
                break;
            case APPROVED:
                allowedTransitions = Arrays.asList(ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW);
                break;
            case CONFIRMED:
                allowedTransitions = Arrays.asList(ReservationStatus.COMPLETED);
                break;
            case COMPLETED:
            case CANCELLED:
            case NO_SHOW:
                allowedTransitions = Arrays.asList();
                break;
            default:
                allowedTransitions = Arrays.asList();
        }
        
        if (!allowedTransitions.contains(target)) {
            throw new InvalidStatusTransitionException(current, target, allowedTransitions);
        }
    }

    private void updateTableStatus(UUID tableId, TableStatus status) {
        if (tableId != null) {
            areaTableService.setStatusByStaff(tableId, status);
        }
    }

    @Transactional
    public ReservationDTO approve(UUID id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        validateStatusTransition(reservation.getStatus(), ReservationStatus.APPROVED);
        
        reservation.setStatus(ReservationStatus.APPROVED);
        reservation = reservationRepository.save(reservation);
        
        if (reservation.getCustomerEmail() != null && !reservation.getCustomerEmail().isBlank()) {
            ReservationApprovalMailRequest mailRequest = 
                    ReservationMapper.toApprovalMailRequest(reservation);
            mailService.sendReservationApprovalMail(mailRequest);
        }
        
        return ReservationMapper.toDTO(reservation);
    }

    @Transactional
    public ReservationDTO reject(UUID id, String reason) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        validateStatusTransition(reservation.getStatus(), ReservationStatus.CANCELLED);
        
        reservation.setStatus(ReservationStatus.CANCELLED);
        if (reason != null && !reason.isBlank()) {
            reservation.setRejectionReason(reason);
        }
        
        if (reservation.getAreaTable() != null) {
            updateTableStatus(reservation.getAreaTable().getAreaTableId(), TableStatus.FREE);
        }
        
        reservation = reservationRepository.save(reservation);
        
        if (reservation.getCustomerEmail() != null && !reservation.getCustomerEmail().isBlank()) {
            ReservationRejectionMailRequest mailRequest = 
                    ReservationMapper.toRejectionMailRequest(reservation, reason);
            mailService.sendReservationRejectionMail(mailRequest);
        }
        
        return ReservationMapper.toDTO(reservation);
    }

    @Transactional
    public ReservationDTO markArrived(UUID id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        validateStatusTransition(reservation.getStatus(), ReservationStatus.CONFIRMED);
        
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setArrivalTime(Instant.now());
        
        if (reservation.getAreaTable() != null) {
            updateTableStatus(reservation.getAreaTable().getAreaTableId(), TableStatus.OCCUPIED);
        }
        
        reservation = reservationRepository.save(reservation);
        
        return ReservationMapper.toDTO(reservation);
    }

    @Transactional
    public ReservationDTO complete(UUID id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        validateStatusTransition(reservation.getStatus(), ReservationStatus.COMPLETED);
        
        reservation.setStatus(ReservationStatus.COMPLETED);
        reservation.setCompletionTime(Instant.now());
        
        if (reservation.getAreaTable() != null) {
            updateTableStatus(reservation.getAreaTable().getAreaTableId(), TableStatus.FREE);
        }
        
        reservation = reservationRepository.save(reservation);
        
        return ReservationMapper.toDTO(reservation);
    }

    @Transactional
    public ReservationDTO markNoShow(UUID id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        validateStatusTransition(reservation.getStatus(), ReservationStatus.NO_SHOW);
        
        reservation.setStatus(ReservationStatus.NO_SHOW);
        
        if (reservation.getAreaTable() != null) {
            updateTableStatus(reservation.getAreaTable().getAreaTableId(), TableStatus.FREE);
        }
        
        reservation = reservationRepository.save(reservation);
        
        if (reservation.getCustomerEmail() != null && !reservation.getCustomerEmail().isBlank()) {
            ReservationNoShowMailRequest mailRequest = 
                    ReservationMapper.toNoShowMailRequest(reservation);
            mailService.sendReservationNoShowMail(mailRequest);
        }
        
        return ReservationMapper.toDTO(reservation);
    }

    public List<ReservationDTO> filterReservations(UUID branchId, List<ReservationStatus> statuses, LocalDate startDate, LocalDate endDate, String search) {
        List<Reservation> reservations = new ArrayList<>();
        
        boolean hasStatuses = statuses != null && !statuses.isEmpty();
        boolean hasDateRange = startDate != null && endDate != null;
        boolean hasSearch = search != null && !search.isBlank();
        
        if (hasStatuses && hasDateRange) {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
            reservations = reservationRepository.findByBranch_BranchIdAndStatusInAndStartTimeBetween(
                    branchId, statuses, startDateTime, endDateTime);
        } else if (hasStatuses) {
            reservations = reservationRepository.findByBranch_BranchIdAndStatusIn(branchId, statuses);
        } else if (hasDateRange) {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
            reservations = reservationRepository.findByBranch_BranchIdAndStartTimeBetween(
                    branchId, startDateTime, endDateTime);
        } else {
            reservations = reservationRepository.findByBranch_BranchId(branchId);
        }
        
        if (hasSearch) {
            String searchLower = search.toLowerCase();
            reservations = reservations.stream()
                    .filter(r -> 
                            (r.getCustomerName() != null && r.getCustomerName().toLowerCase().contains(searchLower)) ||
                            (r.getCustomerPhone() != null && r.getCustomerPhone().toLowerCase().contains(searchLower)) ||
                            (r.getCustomerEmail() != null && r.getCustomerEmail().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }
        
        return reservations.stream()
                .sorted(Comparator.comparing(Reservation::getStartTime))
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ============ TIME-BASED AVAILABILITY LOGIC ============

    private boolean isOverlapping(LocalDateTime start1, LocalDateTime end1,
                                   LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    private boolean hasTableConflict(UUID branchId, UUID tableId, LocalDateTime requestedStart, Integer estimatedDuration) {
        if (tableId == null) {
            return false;
        }

        int duration = estimatedDuration != null ? estimatedDuration : DEFAULT_DURATION;
        LocalDateTime requestedEnd = requestedStart.plusMinutes(duration + BUFFER_MINUTES);

        List<Reservation> reservations = reservationRepository
                .findByBranch_BranchIdAndStatusIn(
                        branchId,
                        Arrays.asList(ReservationStatus.APPROVED, ReservationStatus.CONFIRMED)
                );

        for (Reservation r : reservations) {
            if (r.getAreaTable() == null) continue;
            if (!r.getAreaTable().getAreaTableId().equals(tableId)) continue;

            LocalDateTime existingStart = r.getStartTime();
            int existingDuration = r.getEstimatedDurationMinutes() != null
                    ? r.getEstimatedDurationMinutes()
                    : DEFAULT_DURATION;
            LocalDateTime existingEnd = existingStart.plusMinutes(existingDuration + BUFFER_MINUTES);

            if (isOverlapping(existingStart, existingEnd, requestedStart, requestedEnd)) {
                return true;
            }
        }

        return false;
    }

    public List<TableAvailabilityDTO> getAvailableTables(UUID branchId,
                                                          LocalDateTime requestedStart,
                                                          int guestCount,
                                                          Integer estimatedDuration) {
        int duration = estimatedDuration != null ? estimatedDuration : DEFAULT_DURATION;
        LocalDateTime requestedEnd = requestedStart.plusMinutes(duration + BUFFER_MINUTES);

        List<AreaTable> tables = areaTableRepository.findByArea_Branch_BranchId(branchId);

        List<Reservation> reservations = reservationRepository
                .findByBranch_BranchIdAndStatusIn(
                        branchId,
                        Arrays.asList(ReservationStatus.APPROVED, ReservationStatus.CONFIRMED)
                );

        List<TableAvailabilityDTO> result = new ArrayList<>();

        for (AreaTable table : tables) {
            if (table.getCapacity() < guestCount) continue;

            boolean hasConflict = false;
            boolean risky = false;
            String reason = null;

            for (Reservation r : reservations) {
                if (r.getAreaTable() == null) continue;
                if (!r.getAreaTable().getAreaTableId().equals(table.getAreaTableId())) continue;

                LocalDateTime existingStart = r.getStartTime();
                int existingDuration = r.getEstimatedDurationMinutes() != null
                        ? r.getEstimatedDurationMinutes()
                        : DEFAULT_DURATION;
                LocalDateTime existingEnd = existingStart.plusMinutes(existingDuration + BUFFER_MINUTES);

                if (isOverlapping(existingStart, existingEnd, requestedStart, requestedEnd)) {
                    hasConflict = true;
                    reason = "Overlaps with existing reservation";
                    break;
                }

                // Check if risky: gap < 30 minutes
                long gapBefore = Duration.between(existingEnd, requestedStart).toMinutes();
                long gapAfter = Duration.between(requestedEnd, existingStart).toMinutes();
                
                if (gapBefore >= 0 && gapBefore <= RISKY_GAP_MINUTES) {
                    risky = true;
                    reason = "Less than 30 minutes after previous reservation";
                } else if (gapAfter >= 0 && gapAfter <= RISKY_GAP_MINUTES) {
                    risky = true;
                    reason = "Less than 30 minutes before next reservation";
                }
            }

            TableAvailabilityDTO dto = new TableAvailabilityDTO();
            dto.setTableId(table.getAreaTableId());
            dto.setTableTag(table.getTag());
            dto.setCapacity(table.getCapacity());
            dto.setReason(reason);

            if (hasConflict) {
                dto.setStatus("UNAVAILABLE");
            } else if (risky) {
                dto.setStatus("RISKY");
            } else {
                dto.setStatus("AVAILABLE");
            }

            result.add(dto);
        }

        return result;
    }

    public ReservationAnalyticsDTO getAnalytics(UUID branchId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        
        long pendingCount = reservationRepository.countByBranchAndStatusAndDateRange(
                branchId, ReservationStatus.PENDING, startDateTime, endDateTime);
        long approvedCount = reservationRepository.countByBranchAndStatusAndDateRange(
                branchId, ReservationStatus.APPROVED, startDateTime, endDateTime);
        long confirmedCount = reservationRepository.countByBranchAndStatusAndDateRange(
                branchId, ReservationStatus.CONFIRMED, startDateTime, endDateTime);
        long completedCount = reservationRepository.countByBranchAndStatusAndDateRange(
                branchId, ReservationStatus.COMPLETED, startDateTime, endDateTime);
        long cancelledCount = reservationRepository.countByBranchAndStatusAndDateRange(
                branchId, ReservationStatus.CANCELLED, startDateTime, endDateTime);
        long noShowCount = reservationRepository.countByBranchAndStatusAndDateRange(
                branchId, ReservationStatus.NO_SHOW, startDateTime, endDateTime);
        
        long totalReservations = pendingCount + approvedCount + confirmedCount + completedCount + cancelledCount + noShowCount;
        
        double approvalRate = 0.0;
        if (approvedCount + cancelledCount > 0) {
            approvalRate = (double) approvedCount / (approvedCount + cancelledCount) * 100;
        }
        
        double noShowRate = 0.0;
        if (approvedCount > 0) {
            noShowRate = (double) noShowCount / approvedCount * 100;
        }
        
        List<Reservation> completedReservations = reservationRepository.findByBranch_BranchIdAndStatusInAndStartTimeBetween(
                branchId, Arrays.asList(ReservationStatus.COMPLETED), startDateTime, endDateTime);
        
        double averageServiceDurationMinutes = 0.0;
        if (!completedReservations.isEmpty()) {
            long totalDurationMinutes = completedReservations.stream()
                    .filter(r -> r.getArrivalTime() != null && r.getCompletionTime() != null)
                    .mapToLong(r -> Duration.between(r.getArrivalTime(), r.getCompletionTime()).toMinutes())
                    .sum();
            
            long countWithDuration = completedReservations.stream()
                    .filter(r -> r.getArrivalTime() != null && r.getCompletionTime() != null)
                    .count();
            
            if (countWithDuration > 0) {
                averageServiceDurationMinutes = (double) totalDurationMinutes / countWithDuration;
            }
        }
        
        ReservationAnalyticsDTO analytics = new ReservationAnalyticsDTO();
        analytics.setTotalReservations(totalReservations);
        analytics.setPendingCount(pendingCount);
        analytics.setApprovedCount(approvedCount);
        analytics.setConfirmedCount(confirmedCount);
        analytics.setCompletedCount(completedCount);
        analytics.setCancelledCount(cancelledCount);
        analytics.setNoShowCount(noShowCount);
        analytics.setApprovalRate(approvalRate);
        analytics.setNoShowRate(noShowRate);
        analytics.setAverageServiceDurationMinutes(averageServiceDurationMinutes);
        
        return analytics;
    }
}