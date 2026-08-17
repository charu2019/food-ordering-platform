package com.foodordering.service;

import com.foodordering.dto.kafka.OrderStatusEvent;
import com.foodordering.exception.BusinessException;
import com.foodordering.exception.ResourceNotFoundException;
import com.foodordering.model.entity.Order;
import com.foodordering.model.enums.OrderStatus;
import com.foodordering.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final OrderRepository orderRepository;

    private static final Map<OrderStatus, OrderStatus> VALID_TRANSITIONS = Map.of(
            OrderStatus.PENDING_PAYMENT, OrderStatus.PLACED,
            OrderStatus.PLACED, OrderStatus.PREPARING,
            OrderStatus.PREPARING, OrderStatus.PICKED_UP,
            OrderStatus.PICKED_UP, OrderStatus.DELIVERED
    );

    @KafkaListener(
            topics = "${app.kafka.topics.order-status}",
            groupId = "order-status-group",
            containerFactory = "orderStatusListenerContainerFactory"
    )
    @Transactional
    public void handleOrderStatusEvent(
            ConsumerRecord<String, OrderStatusEvent> record,
            Acknowledgment ack) {
        OrderStatusEvent event = record.value();
        log.info("Received order status event from Kafka: orderId={}, {} -> {}, partition={}, offset={}",
                event.getOrderId(), event.getPreviousStatus(), event.getNewStatus(),
                record.partition(), record.offset());

        try {
            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + event.getOrderId()));

            validateStatusTransition(order.getStatus(), event.getNewStatus());

            order.setStatus(event.getNewStatus());

            if (event.getNewStatus() == OrderStatus.DELIVERED) {
                order.setDeliveredAt(LocalDateTime.now());
            }

            orderRepository.save(order);
            log.info("Order {} status updated to {} via Kafka consumer", event.getOrderId(), event.getNewStatus());

        } catch (Exception e) {
            log.error("Failed to process order status event for order: {}", event.getOrderId(), e);
            throw e;
        } finally {
            ack.acknowledge();
        }
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.CANCELLED) {
            throw new BusinessException("Cannot update status of completed/cancelled order");
        }

        if (currentStatus == OrderStatus.PENDING_PAYMENT && newStatus != OrderStatus.PLACED && newStatus != OrderStatus.CANCELLED) {
            throw new BusinessException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        if (currentStatus == OrderStatus.PLACED && newStatus != OrderStatus.PREPARING && newStatus != OrderStatus.CANCELLED) {
            throw new BusinessException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        if (currentStatus == OrderStatus.PREPARING && newStatus != OrderStatus.PICKED_UP && newStatus != OrderStatus.CANCELLED) {
            throw new BusinessException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        if (currentStatus == OrderStatus.PICKED_UP && newStatus != OrderStatus.DELIVERED && newStatus != OrderStatus.CANCELLED) {
            throw new BusinessException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }
}
