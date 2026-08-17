package com.foodordering.dto.order;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Order Item Request DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {
    
    @NotNull(message = "Menu item ID is required")
    private UUID menuItemId;
    
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}
