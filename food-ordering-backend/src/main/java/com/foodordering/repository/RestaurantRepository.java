package com.foodordering.repository;

import com.foodordering.model.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {
    
    List<Restaurant> findByIsActiveTrue();
    
    List<Restaurant> findByOwnerId(UUID ownerId);
    
    @Query("""
        SELECT r FROM Restaurant r 
        WHERE r.isActive = true 
        AND (
            (6371 * acos(
                cos(radians(:latitude)) * 
                cos(radians(r.latitude)) * 
                cos(radians(r.longitude) - radians(:longitude)) + 
                sin(radians(:latitude)) * 
                sin(radians(r.latitude))
            )) <= :radiusKm
        )
        ORDER BY (
            6371 * acos(
                cos(radians(:latitude)) * 
                cos(radians(r.latitude)) * 
                cos(radians(r.longitude) - radians(:longitude)) + 
                sin(radians(:latitude)) * 
                sin(radians(r.latitude))
            )
        )
        """)
    List<Restaurant> findNearbyRestaurants(
        @Param("latitude") BigDecimal latitude,
        @Param("longitude") BigDecimal longitude,
        @Param("radiusKm") double radiusKm
    );
}