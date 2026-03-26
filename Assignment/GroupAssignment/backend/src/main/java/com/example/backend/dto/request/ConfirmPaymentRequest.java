package com.example.backend.dto.request;

import com.example.backend.entities.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmPaymentRequest {
    private UUID orderId;
    private UUID branchId;
    private PaymentMethod paymentMethod; // e.g., CASH, MOMO, VNPAY
    private String note;
    private String promotionCode;
}
