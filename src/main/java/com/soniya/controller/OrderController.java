package com.soniya.controller;

import com.soniya.entity.Order;
import com.soniya.entity.OrderItem;
import com.soniya.entity.User;
import com.soniya.repository.UserRepository;
import com.soniya.service.OrderService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(
            OrderService orderService,
            UserRepository userRepository) {

        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    // =========================
    // Create Order
    // =========================

    @PostMapping
    public ResponseEntity<Order> createOrder(
            Authentication authentication) {

        Long userId = getUserId(authentication);

        Order order =
                orderService.createOrder(userId);

        return ResponseEntity.ok(order);
    }

    // =========================
    // Get My Orders
    // =========================

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(
            Authentication authentication) {

        Long userId = getUserId(authentication);

        return ResponseEntity.ok(
                orderService.getUserOrders(userId)
        );
    }

    // =========================
    // Get Single Order
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        return ResponseEntity.ok(
                orderService.getOrder(
                        userId,
                        id
                )
        );
    }

    // =========================
    // Get Order Items
    // =========================

    @GetMapping("/{id}/items")
    public ResponseEntity<List<OrderItem>> getOrderItems(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        return ResponseEntity.ok(
                orderService.getOrderItems(
                        userId,
                        id
                )
        );
    }

    // =========================
    // Get User ID
    // =========================

    private Long getUserId(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));

        return user.getId();
    }
}