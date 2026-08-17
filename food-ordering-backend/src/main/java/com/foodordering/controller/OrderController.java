package com.foodordering.controller;

import com.foodordering.dto.order.CreateOrderRequest;
import com.foodordering.dto.order.OrderResponse;
import com.foodordering.dto.order.UpdateOrderStatusRequest;
import com.foodordering.security.JwtUtil;
import com.foodordering.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class OrderController {
    
    private final OrderService orderService;
    private final JwtUtil jwtUtil;
    
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        UUID customerId = extractUserIdFromToken(authHeader);
        OrderResponse response = orderService.createOrder(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @RequestHeader("Authorization") String authHeader
    ) {
        UUID customerId = extractUserIdFromToken(authHeader);
        List<OrderResponse> orders = orderService.getCustomerOrders(customerId);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID id
    ) {
        UUID userId = extractUserIdFromToken(authHeader);
        OrderResponse order = orderService.getOrderById(id, userId);
        return ResponseEntity.ok(order);
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'DELIVERY_PARTNER', 'ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        UUID userId = extractUserIdFromToken(authHeader);
        OrderResponse order = orderService.updateOrderStatus(id, userId, request);
        return ResponseEntity.ok(order);
    }
    
    private UUID extractUserIdFromToken(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}