package com.soniya.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.soniya.dto.CartItemResponse;
import com.soniya.entity.Cart;
import com.soniya.entity.CartItem;
import com.soniya.entity.Product;
import com.soniya.repository.CartItemRepository;
import com.soniya.repository.CartRepository;
import com.soniya.repository.ProductRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository) {

        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    // =========================
    // Get Existing Cart
    // Or Create New Cart
    // =========================

    public Cart getOrCreateCart(Long userId) {

        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {

                    Cart cart = new Cart();

                    cart.setUserId(userId);

                    return cartRepository.save(cart);
                });
    }

    // =========================
    // Get Cart Items
    // =========================

    public List<CartItemResponse> getCartItems(Long userId) {

        Cart cart = getOrCreateCart(userId);

        List<CartItem> items =
                cartItemRepository.findByCartId(cart.getId());

        return items.stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================
    // Convert CartItem to DTO
    // =========================

    private CartItemResponse convertToResponse(CartItem item) {

        Product product = productRepository.findById(
                item.getProductId()
        ).orElse(null);

        String productName =
                product != null
                        ? product.getName()
                        : "Product unavailable";

        BigDecimal totalPrice =
                item.getPriceAtAdd()
                        .multiply(
                                BigDecimal.valueOf(
                                        item.getQuantity()
                                )
                        );

        return new CartItemResponse(
                item.getId(),
                item.getCartId(),
                item.getProductId(),
                productName,
                item.getQuantity(),
                item.getPriceAtAdd(),
                totalPrice
        );
    }

    // =========================
    // Add Product to Cart
    // =========================

    public CartItem addItem(
            Long userId,
            Long productId,
            Integer quantity) {

        if (quantity == null || quantity <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );

        if (!Boolean.TRUE.equals(product.getActive())) {

            throw new RuntimeException(
                    "Product is not available"
            );
        }

        if (product.getStock() < quantity) {

            throw new RuntimeException(
                    "Insufficient stock"
            );
        }

        Cart cart = getOrCreateCart(userId);

        CartItem existingItem =
                cartItemRepository.findByCartIdAndProductId(
                        cart.getId(),
                        productId
                ).orElse(null);

        if (existingItem != null) {

            int newQuantity =
                    existingItem.getQuantity() + quantity;

            if (newQuantity > product.getStock()) {

                throw new RuntimeException(
                        "Requested quantity exceeds stock"
                );
            }

            existingItem.setQuantity(newQuantity);

            return cartItemRepository.save(existingItem);
        }

        CartItem item = new CartItem();

        item.setCartId(cart.getId());

        item.setProductId(productId);

        item.setQuantity(quantity);

        item.setPriceAtAdd(
                BigDecimal.valueOf(product.getPrice())
        );

        return cartItemRepository.save(item);
    }

    // =========================
    // Update Cart Item
    // =========================

    public CartItem updateItem(
            Long userId,
            Long itemId,
            Integer quantity) {

        if (quantity == null || quantity <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart item not found"
                        )
                );

        if (!item.getCartId().equals(cart.getId())) {

            throw new RuntimeException(
                    "You cannot modify this cart item"
            );
        }

        Product product = productRepository.findById(
                item.getProductId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Product not found"
                )
        );

        if (quantity > product.getStock()) {

            throw new RuntimeException(
                    "Requested quantity exceeds stock"
            );
        }

        item.setQuantity(quantity);

        return cartItemRepository.save(item);
    }

    // =========================
    // Remove Cart Item
    // =========================

    public void removeItem(
            Long userId,
            Long itemId) {

        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart item not found"
                        )
                );

        if (!item.getCartId().equals(cart.getId())) {

            throw new RuntimeException(
                    "You cannot delete this cart item"
            );
        }

        cartItemRepository.delete(item);
    }

    // =========================
    // Clear Cart
    // =========================

    public void clearCart(Long userId) {

        Cart cart = getOrCreateCart(userId);

        cartItemRepository.deleteByCartId(
                cart.getId()
        );
    }
}