package com.foodordering.admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.foodordering.admin")
@EntityScan(basePackages = {"com.foodordering.admin.entity", "com.foodordering.admin.enums"})
@EnableJpaRepositories(basePackages = "com.foodordering.admin.repository")
public class AdminApplication {
    public static void main(String[] args) {
        SpringApplication.run(AdminApplication.class, args);
    }
}
