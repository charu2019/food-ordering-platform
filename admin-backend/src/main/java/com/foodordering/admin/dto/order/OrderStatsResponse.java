package com.foodordering.admin.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatsResponse {
    private long totalOrders;
    private long placedCount;
    private long preparingCount;
    private long pickedUpCount;
    private long deliveredCount;
    private long cancelledCount;
    private long pendingPaymentCount;
}
