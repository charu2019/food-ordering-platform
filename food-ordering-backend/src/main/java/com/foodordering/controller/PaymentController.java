package com.foodordering.controller;

import com.foodordering.dto.payment.PaymentRequest;
import com.foodordering.dto.payment.PaymentResponse;
import com.foodordering.security.JwtUtil;
import com.foodordering.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class PaymentController {
    
    private final PaymentService paymentService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/process/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> processPayment(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID orderId,
            @Valid @RequestBody PaymentRequest request
    ) {
        UUID customerId = extractUserIdFromToken(authHeader);
        PaymentResponse response = paymentService.processPayment(orderId, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(
            @PathVariable UUID orderId
    ) {
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(response);
    }
    
    private UUID extractUserIdFromToken(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}
