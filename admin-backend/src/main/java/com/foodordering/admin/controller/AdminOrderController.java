package com.foodordering.admin.controller;

import com.foodordering.admin.dto.order.*;
import com.foodordering.admin.enums.OrderStatus;
import com.foodordering.admin.security.JwtUtil;
import com.foodordering.admin.service.AdminOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) OrderStatus status) {
        List<OrderResponse> orders;
        if (status != null) {
            orders = adminOrderService.getOrdersByStatus(status);
        } else {
            orders = adminOrderService.getAllOrders();
        }
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID id) {
        OrderResponse order = adminOrderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        UUID userId = extractUserIdFromToken(authHeader);
        OrderResponse order = adminOrderService.updateOrderStatus(id, userId, request);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/stats")
    public ResponseEntity<OrderStatsResponse> getOrderStats() {
        OrderStatsResponse stats = adminOrderService.getOrderStats();
        return ResponseEntity.ok(stats);
    }

    private UUID extractUserIdFromToken(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}
