package com.foodordering.admin.service;

import com.foodordering.admin.dto.kafka.OrderStatusEvent;
import com.foodordering.admin.dto.order.*;
import com.foodordering.admin.entity.Order;
import com.foodordering.admin.entity.Payment;
import com.foodordering.admin.enums.OrderStatus;
import com.foodordering.admin.exception.BusinessException;
import com.foodordering.admin.exception.ResourceNotFoundException;
import com.foodordering.admin.repository.OrderRepository;
import com.foodordering.admin.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderEventProducer orderEventProducer;

    private static final Map<OrderStatus, List<OrderStatus>> VALID_TRANSITIONS = Map.of(
            OrderStatus.PENDING_PAYMENT, List.of(OrderStatus.PLACED, OrderStatus.CANCELLED),
            OrderStatus.PLACED, List.of(OrderStatus.PREPARING, OrderStatus.CANCELLED),
            OrderStatus.PREPARING, List.of(OrderStatus.PICKED_UP, OrderStatus.CANCELLED),
            OrderStatus.PICKED_UP, List.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED)
    );

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, UUID userId, UpdateOrderStatusRequest request) {
        log.info("Updating order {} status to: {} by admin: {}", orderId, request.getStatus(), userId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        validateStatusTransition(order.getStatus(), request.getStatus());

        OrderStatusEvent event = OrderStatusEvent.builder()
                .orderId(orderId)
                .previousStatus(order.getStatus())
                .newStatus(request.getStatus())
                .updatedBy(userId)
                .updatedByRole("ADMIN")
                .timestamp(LocalDateTime.now())
                .notes(request.getNotes())
                .build();

        orderEventProducer.sendOrderStatusEvent(event);

        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        log.info("Fetching all orders for admin");
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        log.info("Fetching orders with status: {} for admin", status);
        List<Order> orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        log.info("Fetching order: {} for admin", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderStatsResponse getOrderStats() {
        log.info("Fetching order statistics for admin");
        return OrderStatsResponse.builder()
                .totalOrders(orderRepository.count())
                .placedCount(orderRepository.countByStatus(OrderStatus.PLACED))
                .preparingCount(orderRepository.countByStatus(OrderStatus.PREPARING))
                .pickedUpCount(orderRepository.countByStatus(OrderStatus.PICKED_UP))
                .deliveredCount(orderRepository.countByStatus(OrderStatus.DELIVERED))
                .cancelledCount(orderRepository.countByStatus(OrderStatus.CANCELLED))
                .pendingPaymentCount(orderRepository.countByStatus(OrderStatus.PENDING_PAYMENT))
                .build();
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.CANCELLED) {
            throw new BusinessException("Cannot update status of completed/cancelled order");
        }

        List<OrderStatus> allowedNextStatuses = VALID_TRANSITIONS.get(currentStatus);
        if (allowedNextStatuses == null || !allowedNextStatuses.contains(newStatus)) {
            throw new BusinessException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItem() != null ? item.getMenuItem().getId() : null)
                        .menuItemName(item.getMenuItemName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        var paymentOpt = paymentRepository.findByOrderId(order.getId());
        var payment = paymentOpt.orElse(null);

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getName())
                .restaurantId(order.getRestaurant().getId())
                .restaurantName(order.getRestaurant().getName())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .deliveryAddress(order.getDeliveryAddress())
                .estimatedDeliveryTime(order.getEstimatedDeliveryTime())
                .createdAt(order.getCreatedAt())
                .items(items)
                .paymentStatus(payment != null ? payment.getStatus() : null)
                .paymentMethod(payment != null ? payment.getPaymentMethod() : null)
                .build();
    }
}
