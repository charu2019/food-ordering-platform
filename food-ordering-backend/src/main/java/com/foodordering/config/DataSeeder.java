package com.foodordering.config;

import com.foodordering.model.entity.MenuItem;
import com.foodordering.model.entity.Restaurant;
import com.foodordering.model.entity.User;
import com.foodordering.model.enums.UserRole;
import com.foodordering.repository.MenuItemRepository;
import com.foodordering.repository.RestaurantRepository;
import com.foodordering.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalTime;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {
    
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Bean
    @Profile("dev")
    public CommandLineRunner seedData() {
        return args -> {
            if (userRepository.count() > 0) {
                log.info("Database already contains data. Skipping seed.");
                return;
            }
            
            log.info("Seeding database with sample data...");
            
            // Create sample users
            User customer = createUser("John Doe", "john@example.com", "+919876543210", UserRole.CUSTOMER);
            User restaurantOwner = createUser("Jane Restaurant", "jane@restaurant.com", "+919876543211", UserRole.RESTAURANT_OWNER);
            User deliveryPartner = createUser("Bob Delivery", "bob@delivery.com", "+919876543212", UserRole.DELIVERY_PARTNER);
            User admin = createUser("Admin User", "admin@foodapp.com", "+919876543213", UserRole.ADMIN);
            
            // Create sample restaurants
            Restaurant pizzaPlace = createRestaurant(
                "Pizza Paradise",
                restaurantOwner,
                "123 Main Street, Mohali",
                new BigDecimal("30.7046"),
                new BigDecimal("76.7179"),
                "+919876000001",
                "Best pizza in town!"
            );
            
            Restaurant burgerJoint = createRestaurant(
                "Burger Bonanza",
                restaurantOwner,
                "456 Food Avenue, Mohali",
                new BigDecimal("30.7100"),
                new BigDecimal("76.7200"),
                "+919876000002",
                "Gourmet burgers and more"
            );
            
            Restaurant indianCuisine = createRestaurant(
                "Spice Garden",
                restaurantOwner,
                "789 Curry Lane, Mohali",
                new BigDecimal("30.7000"),
                new BigDecimal("76.7150"),
                "+919876000003",
                "Authentic Indian flavors"
            );
            
            // Add menu items for Pizza Paradise
            createMenuItem(pizzaPlace, "Margherita Pizza", "Classic tomato and mozzarella", "Pizza", new BigDecimal("299.00"), true);
            createMenuItem(pizzaPlace, "Pepperoni Pizza", "Loaded with pepperoni", "Pizza", new BigDecimal("399.00"), false);
            createMenuItem(pizzaPlace, "Veggie Supreme", "Fresh vegetables on thin crust", "Pizza", new BigDecimal("349.00"), true);
            createMenuItem(pizzaPlace, "Garlic Bread", "Crispy garlic bread sticks", "Sides", new BigDecimal("99.00"), true);
            
            // Add menu items for Burger Bonanza
            createMenuItem(burgerJoint, "Classic Burger", "Beef patty with lettuce and tomato", "Burger", new BigDecimal("199.00"), false);
            createMenuItem(burgerJoint, "Veggie Burger", "Plant-based patty", "Burger", new BigDecimal("179.00"), true);
            createMenuItem(burgerJoint, "Cheese Burger", "Double cheese delight", "Burger", new BigDecimal("249.00"), false);
            createMenuItem(burgerJoint, "French Fries", "Crispy golden fries", "Sides", new BigDecimal("79.00"), true);
            
            // Add menu items for Spice Garden
            createMenuItem(indianCuisine, "Butter Chicken", "Creamy tomato curry", "Main Course", new BigDecimal("299.00"), false);
            createMenuItem(indianCuisine, "Paneer Tikka", "Grilled cottage cheese", "Main Course", new BigDecimal("249.00"), true);
            createMenuItem(indianCuisine, "Dal Makhani", "Creamy black lentils", "Main Course", new BigDecimal("199.00"), true);
            createMenuItem(indianCuisine, "Naan", "Butter naan bread", "Bread", new BigDecimal("49.00"), true);
            
            log.info("Database seeding completed successfully!");
        };
    }
    
    private User createUser(String name, String email, String phone, UserRole role) {
        User user = User.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .role(role)
                .passwordHash(passwordEncoder.encode("password123"))
                .isActive(true)
                .build();
        return userRepository.save(user);
    }
    
    private Restaurant createRestaurant(String name, User owner, String address, 
                                       BigDecimal lat, BigDecimal lng, String phone, String description) {
        Restaurant restaurant = Restaurant.builder()
                .name(name)
                .owner(owner)
                .address(address)
                .latitude(lat)
                .longitude(lng)
                .phone(phone)
                .description(description)
                .isActive(true)
                .openingTime(LocalTime.of(9, 0))
                .closingTime(LocalTime.of(22, 0))
                .build();
        return restaurantRepository.save(restaurant);
    }
    
    private void createMenuItem(Restaurant restaurant, String name, String description, 
                                String category, BigDecimal price, boolean isVeg) {
        MenuItem item = MenuItem.builder()
                .restaurant(restaurant)
                .name(name)
                .description(description)
                .category(category)
                .price(price)
                .isAvailable(true)
                .isVegetarian(isVeg)
                .build();
        menuItemRepository.save(item);
    }
}