package com.soniya.controller;

import com.soniya.dto.CartItemRequest;
import com.soniya.dto.CartItemResponse;
import com.soniya.entity.CartItem;
import com.soniya.entity.User;
import com.soniya.repository.UserRepository;
import com.soniya.service.CartService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    public CartController(
            CartService cartService,
            UserRepository userRepository) {

        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    // =========================
    // Get My Cart
    // =========================

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCart(
            Authentication authentication) {

        Long userId = getUserId(authentication);

        return ResponseEntity.ok(
                cartService.getCartItems(userId)
        );
    }

    // =========================
    // Add Item
    // =========================

    @PostMapping("/items")
    public ResponseEntity<CartItem> addItem(
            @Valid @RequestBody CartItemRequest request,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        CartItem item = cartService.addItem(
                userId,
                request.getProductId(),
                request.getQuantity()
        );

        return ResponseEntity.ok(item);
    }

    // =========================
    // Update Item
    // =========================

    @PutMapping("/items/{id}")
    public ResponseEntity<CartItem> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody CartItemRequest request,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        CartItem item = cartService.updateItem(
                userId,
                id,
                request.getQuantity()
        );

        return ResponseEntity.ok(item);
    }

    // =========================
    // Remove Item
    // =========================

    @DeleteMapping("/items/{id}")
    public ResponseEntity<String> removeItem(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        cartService.removeItem(userId, id);

        return ResponseEntity.ok(
                "Cart item removed successfully"
        );
    }

    // =========================
    // Clear Cart
    // =========================

    @DeleteMapping
    public ResponseEntity<String> clearCart(
            Authentication authentication) {

        Long userId = getUserId(authentication);

        cartService.clearCart(userId);

        return ResponseEntity.ok(
                "Cart cleared successfully"
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
                        )
                );

        return user.getId();
    }
}