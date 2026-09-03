/* ============================================
   ORDERS FUNCTIONALITY
   Order Management & History
   ============================================ */

let userOrders = [];

/**
 * Load user's orders from backend
 */
async function loadUserOrders() {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const orders = await apiRequest('/api/orders/my-orders');

        if (orders && Array.isArray(orders)) {
            userOrders = orders;
            displayUserOrders();
            return true;
        } else {
            showEmptyOrders();
            return false;
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showEmptyOrders();
        showToast('Failed to load orders', 'error');
        return false;
    }
}

/**
 * Display user's orders
 */
function displayUserOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    if (userOrders.length === 0) {
        showEmptyOrders();
        return;
    }

    ordersList.innerHTML = '';

    userOrders.forEach(order => {
        // ADJUST FIELD NAMES ACCORDING TO ACTUAL BACKEND RESPONSE
        const {
            id = '',
            orderDate = new Date().toISOString(),
            status = 'Pending',
            totalAmount = 0,
            items = [],
            paymentStatus = 'Pending',
            deliveryAddress = {}
        } = order;

        const orderCard = createOrderCard(
            id, 
            orderDate, 
            status, 
            totalAmount, 
            items, 
            paymentStatus,
            deliveryAddress
        );

        ordersList.appendChild(orderCard);
    });
}

/**
 * Create order card element
 */
function createOrderCard(id, date, status, amount, items, paymentStatus, address) {
    const card = document.createElement('div');
    card.className = 'order-card';

    const formattedDate = formatDate(date);
    const itemCount = items ? items.length : 0;

    card.innerHTML = `
        <div class="order-header">
            <div class="order-id">
                <h3>Order #${escapeHtml(id)}</h3>
                <p class="order-date">${formattedDate}</p>
            </div>
            <div class="order-status">
                <span class="status-badge ${getOrderStatusClass(status)}">
                    ${escapeHtml(status)}
                </span>
                <span class="payment-badge ${getPaymentStatusClass(paymentStatus)}" style="margin-left: var(--spacing-md);">
                    ${escapeHtml(paymentStatus)}
                </span>
            </div>
        </div>

        <div class="order-details">
            <span class="order-items-count">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
            <span class="order-amount">₹${amount.toLocaleString('en-IN')}</span>
        </div>

        <div class="order-actions">
            <button class="btn btn-secondary btn-sm" onclick="viewOrderDetails('${id}')">
                View Details
            </button>
            <button class="btn btn-secondary btn-sm" onclick="trackOrder('${id}')">
                Track Order
            </button>
        </div>
    `;

    return card;
}

/**
 * Get order status class for styling
 */
function getOrderStatusClass(status) {
    const statusMap = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'processing': 'status-processing',
        'shipped': 'status-paid',
        'delivered': 'status-completed',
        'cancelled': 'status-cancelled',
        'returned': 'status-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
}

/**
 * Get payment status class for styling
 */
function getPaymentStatusClass(status) {
    const statusMap = {
        'pending': 'status-pending',
        'paid': 'status-completed',
        'failed': 'status-cancelled',
        'refunded': 'status-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
}

/**
 * View order details
 */
async function viewOrderDetails(orderId) {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const order = await apiRequest(`/api/orders/${orderId}`);

        if (order) {
            displayOrderModal(order);
        } else {
            showToast('Failed to load order details', 'error');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showToast('Failed to load order details', 'error');
    }
}

/**
 * Display order details in modal/popup
 */
function displayOrderModal(order) {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // ADJUST FIELD NAMES ACCORDING TO ACTUAL BACKEND RESPONSE
    const {
        id = '',
        orderDate = new Date().toISOString(),
        status = 'Pending',
        totalAmount = 0,
        items = [],
        paymentStatus = 'Pending',
        deliveryAddress = { street: '', city: '', state: '', pincode: '' }
    } = order;

    let itemsHTML = '';
    if (items && items.length > 0) {
        itemsHTML = items.map(item => `
            <div class="order-modal-item" style="padding: var(--spacing-md); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between;">
                <div>
                    <strong>Product #${escapeHtml(item.productId)}</strong>
                    <p style="font-size: 0.875rem; color: var(--text-secondary);">Qty: ${item.quantity}</p>
                </div>
                <span style="font-weight: 600;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
        `).join('');
    }

    modal.innerHTML = `
        <div style="background-color: var(--bg-primary); border-radius: var(--radius-lg); max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: var(--shadow-lg); padding: var(--spacing-lg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <h2 style="margin-bottom: 0;">Order #${escapeHtml(id)}</h2>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
            </div>

            <div style="background-color: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
                    <div>
                        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xs);">Order Date</p>
                        <strong>${formatDate(orderDate)}</strong>
                    </div>
                    <div>
                        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xs);">Status</p>
                        <span class="status-badge ${getOrderStatusClass(status)}">${escapeHtml(status)}</span>
                    </div>
                    <div>
                        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xs);">Payment Status</p>
                        <span class="status-badge ${getPaymentStatusClass(paymentStatus)}">${escapeHtml(paymentStatus)}</span>
                    </div>
                    <div>
                        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xs);">Total Amount</p>
                        <strong style="font-size: 1.25rem; color: var(--accent-blue);">₹${totalAmount.toLocaleString('en-IN')}</strong>
                    </div>
                </div>
            </div>

            <h3 style="margin-top: var(--spacing-lg);">Order Items</h3>
            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
                ${itemsHTML || '<p style="padding: var(--spacing-lg); text-align: center; color: var(--text-secondary);">No items</p>'}
            </div>

            <h3 style="margin-top: var(--spacing-lg);">Delivery Address</h3>
            <div style="background-color: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg);">
                <p style="margin-bottom: var(--spacing-sm);">${escapeHtml(deliveryAddress.street || '')}</p>
                <p style="margin-bottom: var(--spacing-sm);">${escapeHtml(deliveryAddress.city || '')}, ${escapeHtml(deliveryAddress.state || '')} ${escapeHtml(deliveryAddress.pincode || '')}</p>
            </div>

            <button class="btn btn-primary btn-block" onclick="this.closest('.modal').remove()">Close</button>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Track order
 */
function trackOrder(orderId) {
    showToast(`Tracking order #${orderId}...`, 'info');
    // Would typically open a tracking page or modal
}

/**
 * Cancel order
 */
async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return false;
    }

    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest(`/api/orders/${orderId}/cancel`, {
            method: 'POST'
        });

        if (response.success) {
            showToast('Order cancelled successfully', 'success');
            // Reload orders
            location.reload();
            return true;
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        showToast('Failed to cancel order', 'error');
        return false;
    }
}

/**
 * Get order by ID from user orders
 */
function getOrderById(orderId) {
    return userOrders.find(order => order.id === orderId);
}

/**
 * Filter orders by status
 */
function filterOrdersByStatus(status) {
    return userOrders.filter(order => order.status === status);
}

/**
 * Get orders summary
 */
function getOrdersSummary() {
    return {
        totalOrders: userOrders.length,
        pendingOrders: userOrders.filter(o => o.status === 'pending').length,
        completedOrders: userOrders.filter(o => o.status === 'delivered').length,
        cancelledOrders: userOrders.filter(o => o.status === 'cancelled').length,
        totalSpent: userOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    };
}

/**
 * Show empty orders state
 */
function showEmptyOrders() {
    const container = document.getElementById('ordersContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (container) container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
}

/**
 * Download order receipt (PDF)
 */
function downloadOrderReceipt(orderId) {
    showToast('Downloading receipt...', 'info');
    // Would typically call backend to generate PDF
    // window.location.href = `/api/orders/${orderId}/receipt`;
}

/**
 * Request refund
 */
async function requestRefund(orderId) {
    const reason = prompt('Please provide a reason for refund:');
    if (!reason) return;

    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest(`/api/orders/${orderId}/refund`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });

        if (response.success) {
            showToast('Refund request submitted', 'success');
            return true;
        }
    } catch (error) {
        console.error('Error requesting refund:', error);
        showToast('Failed to request refund', 'error');
        return false;
    }
}
