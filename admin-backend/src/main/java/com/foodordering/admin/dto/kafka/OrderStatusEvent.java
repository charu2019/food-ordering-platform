package com.foodordering.admin.dto.kafka;

import com.foodordering.admin.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusEvent implements Serializable {
    private UUID orderId;
    private OrderStatus previousStatus;
    private OrderStatus newStatus;
    private UUID updatedBy;
    private String updatedByRole;
    private LocalDateTime timestamp;
    private String notes;
}
