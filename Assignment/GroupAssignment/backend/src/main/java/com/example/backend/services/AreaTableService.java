package com.example.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.AreaTableDTO;
import com.example.backend.entities.Area;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.RoleName;
import com.example.backend.entities.StaffAccount;
import com.example.backend.entities.TableStatus;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.AreaTableMapper;
import com.example.backend.repositories.AreaRepository;
import com.example.backend.repositories.AreaTableRepository;
import com.example.backend.repositories.StaffAccountRepository;

@Service
public class AreaTableService {

    private final AreaTableRepository areaTableRepository;
    private final AreaRepository areaRepository;
    private final AreaTableMapper areaTableMapper;
    private final QrCodeService qrCodeService;
    private final StaffAccountRepository staffAccountRepository;
    private final NotificationService notificationService;

    public AreaTableService(
            AreaTableRepository areaTableRepository,
            AreaRepository areaRepository,
            AreaTableMapper areaTableMapper,
            QrCodeService qrCodeService,
            StaffAccountRepository staffAccountRepository,
            NotificationService notificationService) {
        this.areaTableRepository = areaTableRepository;
        this.areaRepository = areaRepository;
        this.areaTableMapper = areaTableMapper;
        this.qrCodeService = qrCodeService;
        this.staffAccountRepository = staffAccountRepository;
        this.notificationService = notificationService;
    }

    private Object getCurrentPrincipal() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            return authentication.getPrincipal();
        }
        throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    private void checkAreaAccess(UUID areaId) {
        Object principal = getCurrentPrincipal();
        Area area = areaRepository.findById(areaId)
                .orElseThrow(() -> new AppException(ErrorCode.AREA_NOT_FOUND));

        if (principal instanceof User) {
            // Restaurant Owner - check if they own the restaurant
            User user = (User) principal;
            if (!area.getBranch().getRestaurant().getUser().getUserId().equals(user.getUserId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        } else if (principal instanceof StaffAccount) {
            // Staff - check if they work at this branch
            StaffAccount staff = (StaffAccount) principal;
            if (!staff.getBranch().getBranchId().equals(area.getBranch().getBranchId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        } else {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private void checkBranchManagerAccess(UUID areaId) {
        Object principal = getCurrentPrincipal();
        Area area = areaRepository.findById(areaId)
                .orElseThrow(() -> new AppException(ErrorCode.AREA_NOT_FOUND));

        if (principal instanceof User) {
            User user = (User) principal;
            if (!area.getBranch().getRestaurant().getUser().getUserId().equals(user.getUserId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        } else if (principal instanceof StaffAccount) {
            StaffAccount staff = (StaffAccount) principal;
            
            StaffAccount staffWithRole = staffAccountRepository.findByIdWithRole(staff.getStaffAccountId())
                    .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));
            
            if (!staffWithRole.getBranch().getBranchId().equals(area.getBranch().getBranchId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            if (!RoleName.BRANCH_MANAGER.equals(staffWithRole.getRole().getName())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        } else {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    public List<AreaTableDTO> getAll() {
        return areaTableRepository.findAll().stream()
                .map(areaTableMapper::toDto)
                .toList();
    }

    public Page<AreaTableDTO> getAllPaginated(Pageable pageable) {
        return areaTableRepository.findAll(pageable)
                .map(areaTableMapper::toDto);
    }

    public AreaTableDTO getById(UUID id) {
        AreaTable table = areaTableRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
        return areaTableMapper.toDto(table);
    }

    public List<AreaTableDTO> getByArea(UUID areaId) {
        checkAreaAccess(areaId);
        return areaTableRepository.findByArea_AreaId(areaId).stream()
                .map(areaTableMapper::toDto)
                .toList();
    }
    public List<AreaTableDTO> getByPublicArea(UUID areaId) {

        return areaTableRepository.findByArea_AreaId(areaId).stream()
                .map(areaTableMapper::toDto)
                .toList();
    }

    public Page<AreaTableDTO> getByAreaPaginated(UUID areaId, Pageable pageable) {
        checkAreaAccess(areaId);
        return areaTableRepository.findByArea_AreaId(areaId, pageable)
                .map(areaTableMapper::toDto);
    }

    public List<AreaTableDTO> getByBranch(UUID branchId) {
        return areaTableRepository.findByBranchId(branchId).stream()
                .map(areaTableMapper::toDto)
                .toList();
    }

    public Page<AreaTableDTO> getByBranchPaginated(UUID branchId, Pageable pageable) {
        return areaTableRepository.findByBranchId(branchId, pageable)
                .map(areaTableMapper::toDto);
    }

    public List<AreaTableDTO> getByAreaAndStatus(UUID areaId, TableStatus status) {
        checkAreaAccess(areaId);
        return areaTableRepository.findByArea_AreaIdAndStatus(areaId, status).stream()
                .map(areaTableMapper::toDto)
                .toList();
    }

    @Transactional
    public AreaTableDTO create(AreaTableDTO dto) {
        if (dto.getAreaId() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        // Validate capacity
        if (dto.getCapacity() == null || dto.getCapacity() <= 0) {
            throw new AppException(ErrorCode.INVALID_CAPACITY);
        }

        // Only Branch Manager can create tables
        checkBranchManagerAccess(dto.getAreaId());

        Area area = areaRepository.findById(dto.getAreaId())
                .orElseThrow(() -> new AppException(ErrorCode.AREA_NOT_FOUND));

        // Check if table tag already exists in this area
        if (areaTableRepository.existsByArea_AreaIdAndTag(dto.getAreaId(), dto.getTag())) {
            throw new AppException(ErrorCode.TABLE_TAG_EXISTED);
        }

        AreaTable table = areaTableMapper.toEntity(dto);
        table.setArea(area);
        table.setStatus(TableStatus.FREE);

        // Save first to get the ID
        AreaTable saved = areaTableRepository.save(table);

        // Generate QR code with the table ID
        try {
            String qrCode = qrCodeService.generateTableQrCode(saved.getAreaTableId());
            saved.setQr(qrCode);
            // Save again with QR code
            saved = areaTableRepository.save(saved);
        } catch (Exception e) {
            // If QR generation fails, log but don't fail the entire operation
        }

        return areaTableMapper.toDto(saved);
    }

    @Transactional
    public AreaTableDTO update(UUID id, AreaTableDTO dto) {
        AreaTable existing = areaTableRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));

        // Only Restaurant Owner and Branch Manager can update tables
        checkBranchManagerAccess(existing.getArea().getAreaId());

        // Validate capacity if provided
        if (dto.getCapacity() != null && dto.getCapacity() <= 0) {
            throw new AppException(ErrorCode.INVALID_CAPACITY);
        }

        // Check if new tag conflicts with existing table in same area
        if (dto.getTag() != null && !dto.getTag().equals(existing.getTag())) {
            if (areaTableRepository.existsByArea_AreaIdAndTag(
                    existing.getArea().getAreaId(), dto.getTag())) {
                throw new AppException(ErrorCode.TABLE_TAG_EXISTED);
            }
        }

        areaTableMapper.updateEntityFromDto(dto, existing);
        AreaTable saved = areaTableRepository.save(existing);
        return areaTableMapper.toDto(saved);
    }

    @Transactional
    public void delete(UUID id) {
        AreaTable table = areaTableRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));

        // Only Restaurant Owner and Branch Manager can delete tables
        checkBranchManagerAccess(table.getArea().getAreaId());

        areaTableRepository.delete(table);
    }

    @Transactional
    public AreaTableDTO setStatus(UUID id, TableStatus status) {
        AreaTable table = areaTableRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));

        // Only Restaurant Owner and Branch Manager can change table status
        checkBranchManagerAccess(table.getArea().getAreaId());

        table.setStatus(status);
        AreaTable saved = areaTableRepository.save(table);
        
        // Emit WebSocket event for real-time update
        UUID branchId = table.getArea().getBranch().getBranchId();
        notificationService.emitTableStatusChanged(branchId, id, status);
        
        return areaTableMapper.toDto(saved);
    }

    @Transactional
    public AreaTableDTO setStatusByStaff(UUID id, TableStatus status) {
        AreaTable table = areaTableRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));

        checkAreaAccess(table.getArea().getAreaId());

        table.setStatus(status);
        AreaTable saved = areaTableRepository.save(table);
        
        // Emit WebSocket event for real-time update
        UUID branchId = table.getArea().getBranch().getBranchId();
        notificationService.emitTableStatusChanged(branchId, id, status);
        
        return areaTableMapper.toDto(saved);
    }

    @Transactional
    public AreaTableDTO markOutOfOrder(UUID id) {
        return setStatus(id, TableStatus.INACTIVE);
    }

    @Transactional
    public AreaTableDTO markAvailable(UUID id) {
        return setStatus(id, TableStatus.FREE);
    }

    @Transactional
    public AreaTableDTO markOccupied(UUID id) {
        return setStatus(id, TableStatus.OCCUPIED);
    }

    public AreaTableDTO getByQrCode(String qrCode) {
        AreaTable table = areaTableRepository.findByQr(qrCode)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
        return areaTableMapper.toDto(table);
    }
//    public String getSlugByTableId(UUID id){
//        AreaTable table = areaTableRepository.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
//        Area area = table.getArea();
//       return area.getBranch().getRestaurant().getPublicUrl();
//    }
}
