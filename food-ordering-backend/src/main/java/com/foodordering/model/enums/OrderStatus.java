package com.foodordering.model.enums;

/**
 * Represents the lifecycle status of an order
 */
public enum OrderStatus {
    PENDING_PAYMENT,
    PLACED,
    PREPARING,
    PICKED_UP,
    DELIVERED,
    CANCELLED
}