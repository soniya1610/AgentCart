package com.soniya.service;

import com.soniya.entity.Cart;
import com.soniya.entity.CartItem;
import com.soniya.entity.Order;
import com.soniya.entity.OrderItem;
import com.soniya.entity.Product;
import com.soniya.repository.CartItemRepository;
import com.soniya.repository.CartRepository;
import com.soniya.repository.OrderItemRepository;
import com.soniya.repository.OrderRepository;
import com.soniya.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    // =========================
    // Create Order from Cart
    // =========================

    @Transactional
    public Order createOrder(Long userId) {

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart not found"
                        ));

        List<CartItem> cartItems =
                cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {

            throw new RuntimeException(
                    "Cart is empty"
            );
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Validate products and calculate total
        for (CartItem cartItem : cartItems) {

            Product product = productRepository.findById(
                    cartItem.getProductId()
            ).orElseThrow(() ->
                    new RuntimeException(
                            "Product not found"
                    ));

            if (!Boolean.TRUE.equals(product.getActive())) {

                throw new RuntimeException(
                        "Product is not available"
                );
            }

            if (cartItem.getQuantity() > product.getStock()) {

                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            BigDecimal itemTotal =
                    cartItem.getPriceAtAdd()
                            .multiply(
                                    BigDecimal.valueOf(
                                            cartItem.getQuantity()
                                    )
                            );

            totalAmount = totalAmount.add(itemTotal);
        }

        // =========================
        // Create Order
        // =========================

        Order order = new Order();

        order.setUserId(userId);

        order.setTotalAmount(totalAmount);

        order.setStatus("NEGOTIATION_PENDING");

        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder =
                orderRepository.save(order);

        // =========================
        // Create Order Items
        // =========================

        for (CartItem cartItem : cartItems) {

            OrderItem orderItem = new OrderItem();

            orderItem.setOrderId(savedOrder.getId());

            orderItem.setProductId(
                    cartItem.getProductId()
            );

            orderItem.setQuantity(
                    cartItem.getQuantity()
            );

            orderItem.setPrice(
                    cartItem.getPriceAtAdd()
            );

            orderItemRepository.save(orderItem);
        }

        // =========================
        // Clear Cart
        // =========================

        cartItemRepository.deleteByCartId(
                cart.getId()
        );

        return savedOrder;
    }

    // =========================
    // Get User Orders
    // =========================

    public List<Order> getUserOrders(Long userId) {

        return orderRepository.findByUserId(userId);
    }

    // =========================
    // Get Order
    // =========================

    public Order getOrder(
            Long userId,
            Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));

        if (!order.getUserId().equals(userId)) {

            throw new RuntimeException(
                    "You cannot access this order"
            );
        }

        return order;
    }

    // =========================
    // Get Order Items
    // =========================

    public List<OrderItem> getOrderItems(
            Long userId,
            Long orderId) {

        getOrder(userId, orderId);

        return orderItemRepository.findByOrderId(
                orderId
        );
    }
}