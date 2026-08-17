package com.foodordering.repository;

import com.foodordering.model.entity.Order;
import com.foodordering.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    
    List<Order> findByCustomerId(UUID customerId);
    
    List<Order> findByRestaurantId(UUID restaurantId);
    
    List<Order> findByDeliveryPartnerId(UUID deliveryPartnerId);
    
    List<Order> findByStatus(OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE o.restaurant.id = :restaurantId AND o.status IN :statuses")
    List<Order> findByRestaurantIdAndStatusIn(UUID restaurantId, List<OrderStatus> statuses);
    
    Optional<Order> findByIdAndCustomerId(UUID orderId, UUID customerId);
}