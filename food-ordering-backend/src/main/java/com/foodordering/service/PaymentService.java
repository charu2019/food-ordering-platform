package com.foodordering.service;

import com.foodordering.dto.payment.PaymentRequest;
import com.foodordering.dto.payment.PaymentResponse;
import com.foodordering.exception.BusinessException;
import com.foodordering.exception.ResourceNotFoundException;
import com.foodordering.model.entity.Order;
import com.foodordering.model.entity.Payment;
import com.foodordering.model.enums.OrderStatus;
import com.foodordering.model.enums.PaymentStatus;
import com.foodordering.repository.OrderRepository;
import com.foodordering.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    
    @Transactional
    public Payment initiatePayment(UUID orderId, BigDecimal amount) {
        log.info("Initiating payment for order: {}, amount: {}", orderId, amount);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        Payment payment = Payment.builder()
                .order(order)
                .amount(amount)
                .status(PaymentStatus.INITIATED)
                .provider("MOCK_PAYMENT")
                .transactionRef("MOCK_TXN_" + UUID.randomUUID().toString().substring(0, 8))
                .paymentMethod("CARD")
                .build();
        
        return paymentRepository.save(payment);
    }
    
    @Transactional
    public PaymentResponse processPayment(UUID orderId, PaymentRequest request) {
        log.info("Processing payment for order: {}", orderId);
        
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order"));
        
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BusinessException("Payment already completed");
        }
        
        // Validate card details (mock validation)
        validateCardDetails(request);
        
        // Extract last 4 digits of card
        String lastFour = request.getCardNumber().substring(request.getCardNumber().length() - 4);
        
        // Mock payment processing - always succeeds for demo
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentMethod("CARD");
        payment.setTransactionRef("MOCK_TXN_" + UUID.randomUUID().toString().substring(0, 8));
        payment = paymentRepository.save(payment);
        
        // Update order status
        Order order = payment.getOrder();
        order.setStatus(OrderStatus.PLACED);
        orderRepository.save(order);
        
        log.info("Payment processed successfully for order: {}", orderId);
        
        return mapToResponse(payment, lastFour);
    }
    
    @Transactional
    public PaymentResponse confirmPayment(UUID orderId) {
        log.info("Confirming payment for order: {}", orderId);
        
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order"));
        
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BusinessException("Payment already confirmed");
        }
        
        payment.setStatus(PaymentStatus.SUCCESS);
        payment = paymentRepository.save(payment);
        
        Order order = payment.getOrder();
        order.setStatus(OrderStatus.PLACED);
        orderRepository.save(order);
        
        log.info("Payment confirmed successfully for order: {}", orderId);
        
        return mapToResponse(payment, "XXXX");
    }
    
    @Transactional
    public PaymentResponse failPayment(UUID orderId, String reason) {
        log.info("Failing payment for order: {}", orderId);
        
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order"));
        
        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason);
        payment = paymentRepository.save(payment);
        
        Order order = payment.getOrder();
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        return mapToResponse(payment, "XXXX");
    }
    
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(UUID orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order"));
        
        String lastFour = payment.getTransactionRef() != null ? "XXXX" : null;
        return mapToResponse(payment, lastFour);
    }
    
    private void validateCardDetails(PaymentRequest request) {
        // Mock card validation - in real app, would verify with payment gateway
        String cardNumber = request.getCardNumber().replaceAll("\\s", "");
        
        if (cardNumber.length() != 16) {
            throw new BusinessException("Invalid card number");
        }
        
        // Luhn algorithm check (simplified)
        int sum = 0;
        boolean alternate = false;
        for (int i = cardNumber.length() - 1; i >= 0; i--) {
            int n = Integer.parseInt(cardNumber.substring(i, i + 1));
            if (alternate) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        if (sum % 10 != 0) {
            throw new BusinessException("Invalid card number");
        }
        
        // Validate expiry date
        String[] parts = request.getExpiryDate().split("/");
        int month = Integer.parseInt(parts[0]);
        int year = Integer.parseInt(parts[1]) + 2000;
        
        if (month < 1 || month > 12) {
            throw new BusinessException("Invalid expiry date");
        }
        
        // Check if card is expired
        java.time.LocalDate expiry = java.time.LocalDate.of(year, month, 1).plusMonths(1).minusDays(1);
        if (expiry.isBefore(java.time.LocalDate.now())) {
            throw new BusinessException("Card has expired");
        }
    }
    
    private PaymentResponse mapToResponse(Payment payment, String lastFour) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .transactionRef(payment.getTransactionRef())
                .paymentMethod(payment.getPaymentMethod())
                .cardLastFour(lastFour)
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
