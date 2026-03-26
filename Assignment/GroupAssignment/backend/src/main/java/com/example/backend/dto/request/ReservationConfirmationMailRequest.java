package com.example.backend.dto.request;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReservationConfirmationMailRequest {
    private String restaurantName;
    /** Email người nhận */
    private String mail;

    /** Tên hiển thị của khách hàng */
    private String customerName;

    /** Số điện thoại khách hàng */
    private String customerPhone;

    /** Mã đặt bàn */
    private UUID reservationId;

    /** Thời gian đến */
    private LocalDateTime startTime;

    /** Số lượng khách */
    private int guestNumber;

    /** Ghi chú (tuỳ chọn) */
    private String note;

    // ── Branch info ──

    /** Địa chỉ chi nhánh */
    private String branchAddress;

    // ── Table info (nullable nếu chưa chọn bàn cụ thể) ──

    /** Nhãn / tag của bàn, e.g. "A1" */
    private String tableTag;

    /** Sức chứa bàn */
    private Integer tableCapacity;
}