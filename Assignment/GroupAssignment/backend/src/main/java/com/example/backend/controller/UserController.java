package com.example.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.UserDTO;
import com.example.backend.dto.request.ChangePasswordRequest;
import com.example.backend.dto.request.ForgetPasswordRequest;
import com.example.backend.dto.request.OTPMailRequest;
import com.example.backend.dto.request.OTPValidateMailRequest;
import com.example.backend.dto.request.SignupRequest;
import com.example.backend.dto.request.UserInfoUpdateRequest;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.dto.response.UserInfoResponse;
import com.example.backend.services.MailService;
import com.example.backend.services.MediaService;
import com.example.backend.services.OTPService;
import com.example.backend.services.UserService;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final MailService mailService;
    private final OTPService otpService;
    private final MediaService mediaService;
    
    public UserController(UserService userService, MailService mailService, OTPService otpService, MediaService mediaService) {
        this.userService = userService;
        this.mailService = mailService;
        this.otpService = otpService;
        this.mediaService = mediaService;
    }
    
    @GetMapping("")
    public ApiResponse<List<UserDTO>> getAllUsers() {
        ApiResponse<List<UserDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getAll());
        return apiResponse;
    }
    
    @PostMapping("/signup")
    public ApiResponse<UserDTO> signUp(@RequestBody @Valid SignupRequest signupRequest) {
        ApiResponse<UserDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.signUp(signupRequest));
        return apiResponse;
    }

    @GetMapping("/deleted")
    public ApiResponse<List<UserDTO>> getAllUsersIncludeDeleted() {
        ApiResponse<List<UserDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getAll());
        return apiResponse;
    }

    @GetMapping("/{userId}")
    public ApiResponse<UserDTO> getUserById(@PathVariable UUID userId) {
        ApiResponse<UserDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getUserById(userId));
        return apiResponse;
    }
    
    @PutMapping("")
    public ApiResponse<UserDTO> updateUser(@RequestBody @Valid UserDTO userDTO) {
        ApiResponse<UserDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.updateUser(userDTO));
        return apiResponse;
    }

    @PutMapping("/{userId}/info")
    public ApiResponse<UserInfoResponse> updateUserInfo(
            @PathVariable UUID userId,
            @RequestBody @Valid UserInfoUpdateRequest request) {
        ApiResponse<UserInfoResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.updateUserInfo(userId, request));
        return apiResponse;
    }

    @GetMapping("/{userId}/info")
    public ApiResponse<UserInfoResponse> getUserInfo(@PathVariable UUID userId) {
        ApiResponse<UserInfoResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getUserInfo(userId));
        return apiResponse;
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<UserDTO> setUserStatusById(@PathVariable UUID userId) {
        ApiResponse<UserDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.setUserStatusById(userId));
        return apiResponse;
    }

    @GetMapping("/paginated")
    public ApiResponse<PageResponse<UserDTO>> getUserPaginated(@RequestParam( required = false, defaultValue = "1") int page, @RequestParam( required = false, defaultValue = "1") int size) {
        ApiResponse<PageResponse<UserDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getUserPaginated(page, size));
        return apiResponse;
    }
    
    @PostMapping("/changepass")
    public ApiResponse<Boolean> changePassword(@RequestBody @Valid ChangePasswordRequest changePasswordRequest) {
        ApiResponse<Boolean> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.changePassword(changePasswordRequest));
        return apiResponse;
    }
    
    // send mail to verify user's email
    @PostMapping("/mail")
    public ApiResponse<String> sendMailVerification(@RequestBody @Valid OTPMailRequest otpMailRequest) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        mailService.sendOTPMail(otpMailRequest);
        apiResponse.setResult("send mail successfully");
        return apiResponse;
    }

    @PostMapping("/mail/otp")
    public ApiResponse<Boolean> validateOTP(@RequestBody @Valid OTPValidateMailRequest otpValidateMailRequest) {
        ApiResponse<Boolean> apiResponse = new ApiResponse<>();
        apiResponse.setResult(otpService.validateOTPCode(otpValidateMailRequest.getOtp(), otpValidateMailRequest.getEmail()));
        return apiResponse;
    }
    
    @PostMapping("/forgetpass")
    public ApiResponse<Boolean> forgetPassword(@RequestBody @Valid ForgetPasswordRequest forgetPasswordRequest) {
        ApiResponse<Boolean> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.forgetPassword(forgetPasswordRequest));
        return apiResponse;
    }

    @PostMapping("/{userId}/avatar")
    public ApiResponse<String> uploadAvatar(
            @PathVariable UUID userId, 
            @RequestParam(value = "file", required = false) MultipartFile file) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        
        // If no file provided, delete avatar
        if (file == null || file.isEmpty()) {
            mediaService.deleteAllMediaForTarget(userId, "USER_AVATAR");
            apiResponse.setResult(null);
            return apiResponse;
        }
        
        // Otherwise, upload new avatar
        mediaService.deleteAllMediaForTarget(userId, "USER_AVATAR");
        mediaService.saveMediaForTarget(file, userId, "USER_AVATAR");
        String avatarUrl = mediaService.getImageUrlByTarget(userId, "USER_AVATAR");
        apiResponse.setResult(avatarUrl);
        return apiResponse;
    }

    @GetMapping("/{userId}/avatar")
    public ApiResponse<String> getAvatar(@PathVariable UUID userId) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        String avatarUrl = mediaService.getImageUrlByTarget(userId, "USER_AVATAR");
        apiResponse.setResult(avatarUrl);
        return apiResponse;
    }
}
