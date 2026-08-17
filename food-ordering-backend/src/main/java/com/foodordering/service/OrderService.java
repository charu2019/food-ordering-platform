package com.foodordering.service;

import com.foodordering.dto.order.*;
import com.foodordering.exception.BusinessException;
import com.foodordering.exception.ResourceNotFoundException;
import com.foodordering.model.entity.*;
import com.foodordering.model.enums.OrderStatus;
import com.foodordering.model.enums.PaymentStatus;
import com.foodordering.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    
    @Transactional
    public OrderResponse createOrder(UUID customerId, CreateOrderRequest request) {
        log.info("Creating order for customer: {} at restaurant: {}", customerId, request.getRestaurantId());
        
        // Validate customer
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        // Validate restaurant
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        
        if (!restaurant.getIsActive()) {
            throw new BusinessException("Restaurant is currently not accepting orders");
        }
        
        // Build order
        Order order = Order.builder()
                .customer(customer)
                .restaurant(restaurant)
                .status(OrderStatus.PENDING_PAYMENT)
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryLatitude(request.getDeliveryLatitude())
                .deliveryLongitude(request.getDeliveryLongitude())
                .specialInstructions(request.getSpecialInstructions())
                .totalAmount(BigDecimal.ZERO)
                .build();
        
        // Add order items and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
            
            if (!menuItem.getIsAvailable()) {
                throw new BusinessException("Menu item is not available: " + menuItem.getName());
            }
            
            if (!menuItem.getRestaurant().getId().equals(request.getRestaurantId())) {
                throw new BusinessException("Menu item does not belong to the selected restaurant");
            }
            
            BigDecimal itemTotal = menuItem.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
            
            OrderItem orderItem = OrderItem.builder()
                    .menuItem(menuItem)
                    .menuItemName(menuItem.getName())
                    .quantity(itemRequest.getQuantity())
                    .price(menuItem.getPrice())
                    .build();
            
            order.addOrderItem(orderItem);
        }
        
        order.setTotalAmount(totalAmount);
        order.setEstimatedDeliveryTime(LocalDateTime.now().plusMinutes(30));
        
        // Save order
        order = orderRepository.save(order);
        log.info("Order created with ID: {}, Total: {}", order.getId(), totalAmount);
        
        // Initiate payment
        Payment payment = paymentService.initiatePayment(order.getId(), totalAmount);
        
        return mapToResponse(order);
    }
    
    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, UUID userId, UpdateOrderStatusRequest request) {
        log.info("Updating order {} status to: {}", orderId, request.getStatus());
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Validate status transition
        validateStatusTransition(order.getStatus(), request.getStatus());
        
        order.setStatus(request.getStatus());
        
        if (request.getStatus() == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        
        order = orderRepository.save(order);
        
        return mapToResponse(order);
    }
    
    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(UUID customerId) {
        log.info("Fetching orders for customer: {}", customerId);
        
        List<Order> orders = orderRepository.findByCustomerId(customerId);
        
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId, UUID userId) {
        log.info("Fetching order: {} for user: {}", orderId, userId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        return mapToResponse(order);
    }
    
    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        // Simple validation - can be enhanced
        if (currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.CANCELLED) {
            throw new BusinessException("Cannot update status of completed/cancelled order");
        }
    }
    
    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItem().getId())
                        .menuItemName(item.getMenuItemName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .collect(Collectors.toList());
        
        // Fetch payment info
        PaymentStatus paymentStatus = null;
        String paymentMethod = null;
        String cardLastFour = null;
        
        var paymentOpt = paymentRepository.findByOrderId(order.getId());
        if (paymentOpt.isPresent()) {
            var payment = paymentOpt.get();
            paymentStatus = payment.getStatus();
            paymentMethod = payment.getPaymentMethod();
        }
        
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
                .paymentStatus(paymentStatus)
                .paymentMethod(paymentMethod)
                .cardLastFour(cardLastFour)
                .build();
    }
}