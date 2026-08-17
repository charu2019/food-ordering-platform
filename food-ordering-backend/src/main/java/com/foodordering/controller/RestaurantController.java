package com.foodordering.controller;

import com.foodordering.dto.menu.MenuItemResponse;
import com.foodordering.dto.restaurant.RestaurantResponse;
import com.foodordering.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class RestaurantController {
    
    private final RestaurantService restaurantService;
    
    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> getNearbyRestaurants(
            @RequestParam(required = false) BigDecimal lat,
            @RequestParam(required = false) BigDecimal lng
    ) {
        List<RestaurantResponse> restaurants = restaurantService.getNearbyRestaurants(lat, lng);
        return ResponseEntity.ok(restaurants);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurantById(@PathVariable UUID id) {
        RestaurantResponse restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(restaurant);
    }
    
    @GetMapping("/{id}/menu")
    public ResponseEntity<List<MenuItemResponse>> getRestaurantMenu(@PathVariable UUID id) {
        List<MenuItemResponse> menu = restaurantService.getRestaurantMenu(id);
        return ResponseEntity.ok(menu);
    }
}