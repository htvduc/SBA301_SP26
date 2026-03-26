package com.example.backend.services;

import java.util.List;
import java.util.UUID;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.StaffAccountDTO;
import com.example.backend.dto.request.CreateStaffAccountRequest;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.entities.Branch;
import com.example.backend.entities.Role;
import com.example.backend.entities.RoleName;
import com.example.backend.entities.StaffAccount;
import com.example.backend.entities.EntityStatus; // Import Enum mới
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.StaffAccountMapper;
import com.example.backend.repositories.BranchRepository;
import com.example.backend.repositories.RestaurantRepository;
import com.example.backend.repositories.RoleRepository;
import com.example.backend.repositories.StaffAccountRepository;

@Service
public class StaffAccountService {

    private final StaffAccountRepository staffAccountRepository;
    private final StaffAccountMapper staffAccountMapper;
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestaurantRepository restaurantRepository;

    public StaffAccountService(StaffAccountRepository staffAccountRepository, StaffAccountMapper staffAccountMapper, RoleRepository roleRepository, BranchRepository branchRepository, PasswordEncoder passwordEncoder, RestaurantRepository restaurantRepository) {
        this.staffAccountRepository = staffAccountRepository;
        this.staffAccountMapper = staffAccountMapper;
        this.roleRepository = roleRepository;
        this.branchRepository = branchRepository;
        this.passwordEncoder = passwordEncoder;
        this.restaurantRepository = restaurantRepository;
    }

//    public List<StaffAccountDTO> getAllStaffAccounts() {
//        return staffAccountRepository.findAll().stream().map(staff -> staffAccountMapper.toStaffAccountDTO(staff)).toList();
//    }



    public StaffAccountDTO createStaffAccount(CreateStaffAccountRequest createStaffAccountRequest) {
        Branch branch = branchRepository.findById(createStaffAccountRequest.getBranchId()).orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

        if (staffAccountRepository.existsByUsernameAndBranch_Restaurant_RestaurantId(createStaffAccountRequest.getUsername(), branch.getRestaurant().getRestaurantId())) {
            throw new AppException(ErrorCode.STAFFACCOUNT_USERNAME_EXISTED);
        }

        StaffAccount staffAccount = staffAccountMapper.createStaffAccount(createStaffAccountRequest);
        Role role = roleRepository.findByName(createStaffAccountRequest.getRole().getName()).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOTEXISTED));

        staffAccount.setRole(role);
        staffAccount.setBranch(branch);
        staffAccount.setPassword(passwordEncoder.encode(staffAccount.getPassword()));

        // Mặc định khi tạo mới là ACTIVE
        staffAccount.setStatus(EntityStatus.ACTIVE);

        return staffAccountMapper.toStaffAccountDTO(staffAccountRepository.save(staffAccount));
    }

    public StaffAccountDTO updateStaffAccount(StaffAccountDTO staffAccountDTO) {
        StaffAccount staffAccount = staffAccountRepository.findById(staffAccountDTO.getStaffAccountId())
                .orElseThrow(() -> new AppException(ErrorCode.STAFFACCOUNT_NOTEXISTED));
        Role role = roleRepository.findByName(staffAccountDTO.getRole().getName())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOTEXISTED));

        Branch branch = staffAccount.getBranch();

        if (!staffAccount.getUsername().equals(staffAccountDTO.getUsername()) &&
            staffAccountRepository.existsByUsernameAndBranch_Restaurant_RestaurantId(staffAccountDTO.getUsername(), branch.getRestaurant().getRestaurantId())) {
            throw new AppException(ErrorCode.STAFFACCOUNT_USERNAME_EXISTED);
        }

        staffAccount.setRole(role);
        staffAccount.setUsername(staffAccountDTO.getUsername());


        if (staffAccountDTO.getStatus() != null) {
            staffAccount.setStatus(staffAccountDTO.getStatus());
        }

        return staffAccountMapper.toStaffAccountDTO(staffAccountRepository.save(staffAccount));
    }

    // Sửa logic đảo ngược trạng thái (Toggle status)
    public StaffAccountDTO setStaffAccountStatus(UUID staffAccountId) {
        StaffAccount staffAccount = staffAccountRepository.findById(staffAccountId)
                .orElseThrow(() -> new AppException(ErrorCode.STAFFACCOUNT_NOTEXISTED));


        EntityStatus currentStatus = staffAccount.getStatus();

        if (currentStatus == EntityStatus.DELETED) {
            throw new AppException(ErrorCode.STAFFACCOUNT_DELETED);
        }

        // Chuyển đổi giữa ACTIVE và INACTIVE
        if (currentStatus == EntityStatus.ACTIVE) {
            staffAccount.setStatus(EntityStatus.INACTIVE);
        } else if (currentStatus == EntityStatus.INACTIVE) {
            staffAccount.setStatus(EntityStatus.ACTIVE);
        }

        StaffAccount saved = staffAccountRepository.save(staffAccount);
        return staffAccountMapper.toStaffAccountDTO(saved);
    }

    public PageResponse<StaffAccountDTO> getStaffAccountPaginated(int page, int size, UUID branchId, String keyword, String roleFilter, Boolean isActive) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Branch branch = branchRepository.findById(branchId).orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        String searchKeyword = (keyword == null || keyword.isEmpty()) ? "%%" : "%" + keyword.toLowerCase() + "%";

        RoleName roleNameFilter = null;
        if (roleFilter != null && !roleFilter.isEmpty() && !roleFilter.equals("ALL")) {
            try {
                roleNameFilter = RoleName.valueOf(roleFilter);
            } catch (IllegalArgumentException e) {
                // Ignore invalid role filter
            }
        }

        // Manager view: filter out BRANCH_MANAGER
        Page<StaffAccount> pageData = staffAccountRepository.findByBranchAndFiltersForManager(
            branch, RoleName.BRANCH_MANAGER, searchKeyword, roleNameFilter, isActive, pageable
        );

        PageResponse<StaffAccountDTO> pageResponse = new PageResponse<>();
        pageResponse.setItems(pageData.map(staffAccount -> staffAccountMapper.toStaffAccountDTO(staffAccount)).toList());
        pageResponse.setTotalElements(pageData.getTotalElements());
        pageResponse.setTotalPages(pageData.getTotalPages());
        return pageResponse;
    }

    public long getRoleNumber(UUID branchId, RoleName roleName) {
        Branch branch = branchRepository.findById(branchId).orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        return staffAccountRepository.countByBranchAndRole_Name(branch, roleName);
    }

    public PageResponse<StaffAccountDTO> getStaffAccountByBranchForOwnerPaginated(int page, int size, UUID branchId, String keyword, String roleFilter, Boolean isActive) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Branch branch = branchRepository.findById(branchId).orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        String searchKeyword = (keyword == null || keyword.isEmpty()) ? "%%" : "%" + keyword.toLowerCase() + "%";

        RoleName roleNameFilter = null;
        if (roleFilter != null && !roleFilter.isEmpty() && !roleFilter.equals("ALL")) {
            try {
                roleNameFilter = RoleName.valueOf(roleFilter);
            } catch (IllegalArgumentException e) {
                // Ignore invalid role filter
            }
        }

        // Owner view: includes BRANCH_MANAGER
        Page<StaffAccount> pageData = staffAccountRepository.findByBranchAndFiltersForOwner(
            branch, searchKeyword, roleNameFilter, isActive, pageable
        );

        PageResponse<StaffAccountDTO> pageResponse = new PageResponse<>();
        pageResponse.setItems(pageData.map(staffAccount -> staffAccountMapper.toStaffAccountDTO(staffAccount)).toList());
        pageResponse.setTotalElements(pageData.getTotalElements());
        pageResponse.setTotalPages(pageData.getTotalPages());
        return pageResponse;
    }

    public StaffAccountDTO getStaffAccountById(UUID staffAccountId) {
        // Tìm kiếm nhân viên trong database qua Repository
        StaffAccount staffAccount = staffAccountRepository.findById(staffAccountId)
                .orElseThrow(() -> new AppException(ErrorCode.STAFFACCOUNT_NOTEXISTED));

        // Chuyển đổi Entity sang DTO và trả về
        return staffAccountMapper.toStaffAccountDTO(staffAccount);
    }

    public void resetStaffPassword(UUID staffAccountId, String newPassword) {
        StaffAccount staffAccount = staffAccountRepository.findById(staffAccountId)
                .orElseThrow(() -> new AppException(ErrorCode.STAFFACCOUNT_NOTEXISTED));
        staffAccount.setPassword(passwordEncoder.encode(newPassword));
        staffAccountRepository.save(staffAccount);
    }

    public StaffAccountDTO transferStaffToBranch(UUID staffAccountId, UUID newBranchId) {
        StaffAccount staffAccount = staffAccountRepository.findById(staffAccountId)
                .orElseThrow(() -> new AppException(ErrorCode.STAFFACCOUNT_NOTEXISTED));

        Branch newBranch = branchRepository.findById(newBranchId)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

        // Kiểm tra xem branch mới có cùng restaurant không
        if (!staffAccount.getBranch().getRestaurant().getRestaurantId()
                .equals(newBranch.getRestaurant().getRestaurantId())) {
            throw new AppException(ErrorCode.BRANCH_NOT_SAME_RESTAURANT);
        }

        staffAccount.setBranch(newBranch);
        StaffAccount saved = staffAccountRepository.save(staffAccount);
        return staffAccountMapper.toStaffAccountDTO(saved);
    }
}
