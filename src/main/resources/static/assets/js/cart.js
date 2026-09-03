/* ============================================
   CART FUNCTIONALITY
   Shopping Cart Management
   ============================================ */

/**
 * Get cart from localStorage
 */
function getCart() {
    try {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Error parsing cart:', error);
        return [];
    }
}

/**
 * Save cart to localStorage
 */
function saveCart(cart) {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

/**
 * Add item to cart
 */
function addToCart(productId, quantity = 1, price = 0) {
    if (!isLoggedIn()) {
        showToast('Please login to add items to cart', 'warning');
        setTimeout(() => navigateTo('login.html'), 1000);
        return false;
    }

    try {
        const cart = getCart();
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: productId,
                quantity: quantity,
                price: price
            });
        }

        saveCart(cart);
        showToast('Item added to cart', 'success');
        return true;
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add to cart', 'error');
        return false;
    }
}

/**
 * Remove item from cart
 */
function removeFromCart(index) {
    try {
        const cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        showToast('Item removed from cart', 'success');
        return true;
    } catch (error) {
        console.error('Error removing item:', error);
        return false;
    }
}

/**
 * Update item quantity
 */
function updateItemQuantity(index, newQuantity) {
    try {
        const cart = getCart();
        
        if (newQuantity <= 0) {
            return removeFromCart(index);
        }

        cart[index].quantity = newQuantity;
        saveCart(cart);
        showToast('Cart updated', 'success');
        return true;
    } catch (error) {
        console.error('Error updating quantity:', error);
        return false;
    }
}

/**
 * Update item price (for negotiated prices)
 */
function updateItemPrice(index, newPrice) {
    try {
        const cart = getCart();
        cart[index].price = newPrice;
        saveCart(cart);
        return true;
    } catch (error) {
        console.error('Error updating price:', error);
        return false;
    }
}

/**
 * Clear entire cart
 */
function clearCart() {
    try {
        localStorage.removeItem('cart');
        updateCartBadge();
        return true;
    } catch (error) {
        console.error('Error clearing cart:', error);
        return false;
    }
}

/**
 * Get cart summary
 */
function getCartSummary() {
    const cart = getCart();
    
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const shipping = subtotal > 500 ? 0 : 50;
    const tax = Math.round(subtotal * 0.12); // 12% tax
    const total = subtotal + shipping + tax;

    return {
        items: cart,
        itemCount: cart.length,
        quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total
    };
}

/**
 * Check if cart is empty
 */
function isCartEmpty() {
    return getCart().length === 0;
}

/**
 * Get cart item count
 */
function getCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Check if item exists in cart
 */
function isItemInCart(productId) {
    const cart = getCart();
    return cart.some(item => item.id === productId);
}

/**
 * Get item from cart
 */
function getCartItem(productId) {
    const cart = getCart();
    return cart.find(item => item.id === productId);
}

/**
 * Merge carts (for anonymous to authenticated user transition)
 */
function mergeCartWithUser() {
    // This would be useful if you allow anonymous browsing
    // but currently not implemented as we require login for cart
}

/**
 * Export cart as JSON (for debugging)
 */
function exportCart() {
    const cart = getCart();
    console.log('Current Cart:', cart);
    console.log('Cart Summary:', getCartSummary());
    return cart;
}

/**
 * Import cart from JSON (for debugging)
 */
function importCart(cartData) {
    try {
        if (Array.isArray(cartData)) {
            saveCart(cartData);
            showToast('Cart imported', 'success');
            return true;
        }
    } catch (error) {
        console.error('Error importing cart:', error);
        showToast('Failed to import cart', 'error');
        return false;
    }
}

/**
 * Validate cart items before checkout
 */
function validateCart() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showToast('Your cart is empty', 'warning');
        return false;
    }

    // Check if all items have required fields
    const isValid = cart.every(item => 
        item.id && 
        item.quantity && 
        item.quantity > 0 && 
        item.price !== undefined
    );

    if (!isValid) {
        showToast('Invalid cart items. Please review your cart.', 'error');
        return false;
    }

    return true;
}

/**
 * Prepare cart for order creation
 */
function prepareCartForOrder() {
    const summary = getCartSummary();
    
    return {
        items: summary.items,
        subtotal: summary.subtotal,
        shipping: summary.shipping,
        tax: summary.tax,
        total: summary.total,
        timestamp: new Date().toISOString()
    };
}

/**
 * Estimate shipping cost
 */
function estimateShipping(subtotal) {
    return subtotal > 500 ? 0 : 50;
}

/**
 * Estimate tax
 */
function estimateTax(subtotal, taxRate = 0.12) {
    return Math.round(subtotal * taxRate);
}

/**
 * Apply discount/coupon (placeholder)
 */
function applyCoupon(couponCode) {
    // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
    console.log('Applying coupon:', couponCode);
    // Would typically validate coupon on backend
    showToast('Coupon feature coming soon', 'info');
    return false;
}

/**
 * Watch for cart changes
 */
function watchCartChanges(callback) {
    // Listen for storage changes (useful for multiple tabs)
    window.addEventListener('storage', (event) => {
        if (event.key === 'cart') {
            callback(getCart());
        }
    });
}
