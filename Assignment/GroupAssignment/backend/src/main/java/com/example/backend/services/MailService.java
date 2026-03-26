package com.example.backend.services;

import com.example.backend.dto.request.ReservationConfirmationMailRequest;
import com.example.backend.dto.request.ReservationApprovalMailRequest;
import com.example.backend.dto.request.ReservationRejectionMailRequest;
import com.example.backend.dto.request.ReservationNoShowMailRequest;

import org.springframework.web.client.RestClient;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.example.backend.dto.request.OTPMailRequest;
import com.example.backend.dto.request.SubscriptionReminderMailRequest;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final String EMAIL_VERIFICATION_SUBJECT =
            "[BentoX] Verification Email Guide";

    private static final String SUBSCRIPTION_REMINDER_SUBJECT =
            "[BentoX] Subscription Renewal Reminder";
    private static final String RESERVATION_CONFIRMATION_SUBJECT =
            "Xác nhận đặt bàn thành công";
    private static final String RESERVATION_APPROVAL_SUBJECT =
            "Đặt bàn được chấp nhận";
    private static final String RESERVATION_REJECTION_SUBJECT =
            "Cập nhật đặt bàn";
    private static final String RESERVATION_NO_SHOW_SUBJECT =
            "Cập nhật đặt bàn";
    private final RestClient restClient;
    private final OTPService otpService;
    private final TemplateEngine templateEngine;

    @Value("${brevo.sender_email}")
    private String senderEmail;

    @Value("${brevo.sender_name}")
    private String senderName;

    public MailService(
            @Value("${brevo.mail_base_url}") String baseUrl,
            @Value("${brevo.api_key}") String apiKey,
            OTPService otpService,
            TemplateEngine templateEngine) {

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("accept", "application/json")
                .defaultHeader("api-key", apiKey)
                .build();

        this.otpService = otpService;
        this.templateEngine = templateEngine;
    }

    // ===================== OTP MAIL =====================

    public void sendOTPMail(OTPMailRequest otpMailRequest) {

        String otp = otpService.generateOTPCode(otpMailRequest.getMail());
        String htmlContent = generateHtmlContentOTPMail(
                otpMailRequest.getName(), otp);

        sendMail(
                otpMailRequest.getMail(),
                otpMailRequest.getName(),
                EMAIL_VERIFICATION_SUBJECT,
                htmlContent
        );
    }

    // ===================== SUBSCRIPTION REMINDER =====================

    public void sendSubscriptionReminderMail(
            SubscriptionReminderMailRequest request) {

        Context context = new Context();
        context.setVariable("name", request.getName());
        context.setVariable("packageName", request.getPackageName());
        context.setVariable("endDate", request.getEndDate());
        context.setVariable("renewLink", request.getRenewLink());
        context.setVariable("year", java.time.Year.now().getValue());

        String htmlContent =
                templateEngine.process("subscriptionReminder", context);

        sendMail(
                request.getMail(),
                request.getName(),
                SUBSCRIPTION_REMINDER_SUBJECT,
                htmlContent
        );
    }

    // ===================== COMMON SEND METHOD =====================

    private void sendMail(
            String toEmail,
            String toName,
            String subject,
            String htmlContent) {

        Map<String, Object> requestBody = Map.of(
                "sender", Map.of(
                        "email", senderEmail,
                        "name", senderName),
                "to", List.of(Map.of(
                        "email", toEmail,
                        "name", toName)),
                "subject", subject,
                "htmlContent", htmlContent
        );

        ResponseEntity<String> response = restClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .toEntity(String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException(
                    "Brevo send mail failed: " + response.getBody());
        }
    }

    private String generateHtmlContentOTPMail(String name, String otp) {
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("otp", otp);
        return templateEngine.process("otpMail", context);
    }
    public void sendReservationConfirmationMail(
            ReservationConfirmationMailRequest request) {

        Context context = new Context();
        context.setVariable("restaurantName", request.getRestaurantName());
        context.setVariable("customerName",   request.getCustomerName());
        context.setVariable("customerPhone",  request.getCustomerPhone());
        context.setVariable("reservationId",  request.getReservationId());
        context.setVariable("startTime",      request.getStartTime());
        context.setVariable("guestNumber",    request.getGuestNumber());
        context.setVariable("note",           request.getNote());
        context.setVariable("branchAddress",  request.getBranchAddress());
        context.setVariable("tableTag",       request.getTableTag());
        context.setVariable("tableCapacity",  request.getTableCapacity());
        context.setVariable("year",           java.time.Year.now().getValue());

        String htmlContent =
                templateEngine.process("reservationConfirmation", context);

        sendMail(
                request.getMail(),
                request.getCustomerName(),
                RESERVATION_CONFIRMATION_SUBJECT,
                htmlContent
        );
    }

    public void sendReservationApprovalMail(
            ReservationApprovalMailRequest request) {

        Context context = new Context();
        context.setVariable("restaurantName", request.getRestaurantName());
        context.setVariable("customerName",   request.getCustomerName());
        context.setVariable("reservationId",  request.getReservationId());
        context.setVariable("startTime",      request.getStartTime());
        context.setVariable("guestNumber",    request.getGuestNumber());
        context.setVariable("branchAddress",  request.getBranchAddress());
        context.setVariable("tableTag",       request.getTableTag());
        context.setVariable("tableCapacity",  request.getTableCapacity());
        context.setVariable("note",           request.getNote());

        String htmlContent =
                templateEngine.process("reservationApproval", context);

        sendMail(
                request.getMail(),
                request.getCustomerName(),
                RESERVATION_APPROVAL_SUBJECT,
                htmlContent
        );
    }

    public void sendReservationRejectionMail(
            ReservationRejectionMailRequest request) {

        Context context = new Context();
        context.setVariable("restaurantName", request.getRestaurantName());
        context.setVariable("customerName",   request.getCustomerName());
        context.setVariable("reservationId",  request.getReservationId());
        context.setVariable("startTime",      request.getStartTime());
        context.setVariable("reason",         request.getReason());
        context.setVariable("branchPhone",    request.getBranchPhone());
        context.setVariable("branchEmail",    request.getBranchEmail());

        String htmlContent =
                templateEngine.process("reservationRejection", context);

        sendMail(
                request.getMail(),
                request.getCustomerName(),
                RESERVATION_REJECTION_SUBJECT,
                htmlContent
        );
    }

    public void sendReservationNoShowMail(
            ReservationNoShowMailRequest request) {

        Context context = new Context();
        context.setVariable("restaurantName", request.getRestaurantName());
        context.setVariable("customerName",   request.getCustomerName());
        context.setVariable("reservationId",  request.getReservationId());
        context.setVariable("startTime",      request.getStartTime());
        context.setVariable("branchPhone",    request.getBranchPhone());
        context.setVariable("branchEmail",    request.getBranchEmail());

        String htmlContent =
                templateEngine.process("reservationNoShow", context);

        sendMail(
                request.getMail(),
                request.getCustomerName(),
                RESERVATION_NO_SHOW_SUBJECT,
                htmlContent
        );
    }

}
