package com.foodordering.service;

import com.foodordering.dto.restaurant.RestaurantResponse;
import com.foodordering.dto.menu.MenuItemResponse;
import com.foodordering.exception.ResourceNotFoundException;
import com.foodordering.model.entity.Restaurant;
import com.foodordering.model.entity.MenuItem;
import com.foodordering.repository.RestaurantRepository;
import com.foodordering.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestaurantService {
    
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private static final double DEFAULT_SEARCH_RADIUS_KM = 10.0;
    
    @Transactional(readOnly = true)
    public List<RestaurantResponse> getNearbyRestaurants(BigDecimal latitude, BigDecimal longitude) {
        log.info("Fetching restaurants near lat: {}, lng: {}", latitude, longitude);
        
        List<Restaurant> restaurants;
        
        if (latitude != null && longitude != null) {
            restaurants = restaurantRepository.findNearbyRestaurants(
                    latitude, longitude, DEFAULT_SEARCH_RADIUS_KM
            );
        } else {
            restaurants = restaurantRepository.findByIsActiveTrue();
        }
        
        return restaurants.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public RestaurantResponse getRestaurantById(UUID id) {
        log.info("Fetching restaurant with ID: {}", id);
        
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        
        return mapToResponse(restaurant);
    }
    
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getRestaurantMenu(UUID restaurantId) {
        log.info("Fetching menu for restaurant ID: {}", restaurantId);
        
        // Verify restaurant exists
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found");
        }
        
        List<MenuItem> menuItems = menuItemRepository.findByRestaurantIdAndIsAvailableTrue(restaurantId);
        
        return menuItems.stream()
                .map(this::mapToMenuItemResponse)
                .collect(Collectors.toList());
    }
    
    private RestaurantResponse mapToResponse(Restaurant restaurant) {
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .address(restaurant.getAddress())
                .latitude(restaurant.getLatitude())
                .longitude(restaurant.getLongitude())
                .phone(restaurant.getPhone())
                .description(restaurant.getDescription())
                .imageUrl(restaurant.getImageUrl())
                .isActive(restaurant.getIsActive())
                .openingTime(restaurant.getOpeningTime())
                .closingTime(restaurant.getClosingTime())
                .build();
    }
    
    private MenuItemResponse mapToMenuItemResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .restaurantId(item.getRestaurant().getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .category(item.getCategory())
                .imageUrl(item.getImageUrl())
                .isAvailable(item.getIsAvailable())
                .isVegetarian(item.getIsVegetarian())
                .build();
    }
}