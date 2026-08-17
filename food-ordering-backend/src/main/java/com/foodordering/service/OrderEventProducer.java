package com.foodordering.service;

import com.foodordering.dto.kafka.OrderStatusEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventProducer {

    private final KafkaTemplate<String, OrderStatusEvent> orderStatusKafkaTemplate;

    @Value("${app.kafka.topics.order-status}")
    private String orderStatusTopic;

    public void sendOrderStatusEvent(OrderStatusEvent event) {
        String key = event.getOrderId().toString();
        log.info("Sending order status event to Kafka: orderId={}, {} -> {}",
                event.getOrderId(), event.getPreviousStatus(), event.getNewStatus());

        CompletableFuture<SendResult<String, OrderStatusEvent>> future =
                orderStatusKafkaTemplate.send(orderStatusTopic, key, event);

        future.thenAccept(result -> log.info(
                "Successfully sent order status event for order: {} to partition: {}",
                event.getOrderId(), result.getRecordMetadata().partition()))
              .exceptionally(ex -> {
                  log.error("Failed to send order status event for order: {}",
                          event.getOrderId(), ex);
                  return null;
              });
    }
}
