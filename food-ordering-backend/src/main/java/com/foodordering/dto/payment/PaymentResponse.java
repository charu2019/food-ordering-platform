package com.foodordering.dto.payment;

import com.foodordering.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private UUID id;
    private UUID orderId;
    private PaymentStatus status;
    private BigDecimal amount;
    private String transactionRef;
    private String paymentMethod;
    private String cardLastFour;
    private LocalDateTime createdAt;
}
