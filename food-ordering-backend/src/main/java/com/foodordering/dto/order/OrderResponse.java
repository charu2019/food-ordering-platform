package com.foodordering.dto.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.foodordering.model.enums.OrderStatus;
import com.foodordering.model.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private UUID customerId;
    private String customerName;
    private UUID restaurantId;
    private String restaurantName;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private String deliveryAddress;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private String cardLastFour;
}
