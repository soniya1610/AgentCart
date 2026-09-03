/* ============================================
   PAYMENT UTILITIES
   Razorpay Integration & Payment Handling
   ============================================ */

// Razorpay configuration
const RAZORPAY_CONFIG = {
    // ADJUST TO YOUR RAZORPAY KEY ID
    // Use test key for development, production key for live
    keyId: 'rzp_test_YOUR_KEY_ID_HERE'
};

/**
 * Initialize Razorpay payment
 */
function initializeRazorpay() {
    // Check if Razorpay script is loaded
    if (typeof Razorpay === 'undefined') {
        console.error('Razorpay library not loaded');
        showToast('Payment system not available', 'error');
        return false;
    }
    return true;
}

/**
 * Create payment order on backend
 */
async function createPaymentOrder(amount, currency = 'INR') {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest('/api/payments/create-order', {
            method: 'POST',
            body: JSON.stringify({
                amount: amount, // Amount in paise (e.g., 50000 for ₹500)
                currency: currency,
                receipt: `receipt_${Date.now()}`
            })
        });

        // ADJUST ACCORDING TO ACTUAL BACKEND RESPONSE
        // Expected: { orderId: "order_...", keyId: "rzp_...", amount: 50000 }
        
        if (response.orderId) {
            return response;
        } else {
            throw new Error('Failed to create payment order');
        }
    } catch (error) {
        console.error('Error creating payment order:', error);
        throw error;
    }
}

/**
 * Open Razorpay checkout
 */
function openRazorpayCheckout(options) {
    if (!initializeRazorpay()) {
        return false;
    }

    return new Promise((resolve, reject) => {
        const defaultOptions = {
            key: RAZORPAY_CONFIG.keyId,
            currency: 'INR',
            ...options,
            handler: function(response) {
                resolve(response);
            },
            modal: {
                ondismiss: function() {
                    reject(new Error('Payment cancelled by user'));
                }
            }
        };

        try {
            const razorpay = new Razorpay(defaultOptions);
            razorpay.open();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Verify payment on backend
 */
async function verifyPayment(paymentData) {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest('/api/payments/verify', {
            method: 'POST',
            body: JSON.stringify({
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_signature: paymentData.razorpay_signature
            })
        });

        // ADJUST ACCORDING TO ACTUAL BACKEND RESPONSE
        // Expected: { success: true, orderId: "...", message: "Payment verified" }
        
        if (response.success) {
            return response;
        } else {
            throw new Error('Payment verification failed');
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
}

/**
 * Process complete payment flow
 */
async function processPayment(amount, userInfo = {}) {
    try {
        // Step 1: Create order on backend
        const orderData = await createPaymentOrder(amount);
        
        // Step 2: Open Razorpay checkout
        const paymentResponse = await openRazorpayCheckout({
            order_id: orderData.orderId,
            amount: amount,
            description: 'AgentCart Purchase',
            prefill: {
                name: userInfo.name || '',
                email: userInfo.email || '',
                contact: userInfo.phone || ''
            },
            theme: {
                color: '#0066cc'
            }
        });

        // Step 3: Verify payment on backend
        const verificationResult = await verifyPayment(paymentResponse);
        
        return verificationResult;
    } catch (error) {
        console.error('Payment processing error:', error);
        throw error;
    }
}

/**
 * Check payment status
 */
async function checkPaymentStatus(orderId) {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest(`/api/payments/status/${orderId}`);
        return response;
    } catch (error) {
        console.error('Error checking payment status:', error);
        throw error;
    }
}

/**
 * Get payment methods
 */
async function getPaymentMethods() {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const methods = await apiRequest('/api/payments/methods');
        return methods;
    } catch (error) {
        console.error('Error getting payment methods:', error);
        return [];
    }
}

/**
 * Request refund
 */
async function requestRefund(paymentId, reason = '') {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest(`/api/payments/${paymentId}/refund`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });

        if (response.success) {
            return response;
        } else {
            throw new Error('Refund request failed');
        }
    } catch (error) {
        console.error('Error requesting refund:', error);
        throw error;
    }
}

/**
 * Format amount for Razorpay (convert to paise)
 */
function formatAmountForRazorpay(amountInRupees) {
    return Math.round(amountInRupees * 100); // Convert to paise
}

/**
 * Format amount from paise to rupees
 */
function formatAmountFromRazorpay(amountInPaise) {
    return amountInPaise / 100;
}

/**
 * Validate payment amount
 */
function validatePaymentAmount(amount) {
    if (amount <= 0) {
        showToast('Invalid payment amount', 'error');
        return false;
    }
    if (amount > 10000000) { // Max ₹100,000
        showToast('Payment amount exceeds maximum limit', 'error');
        return false;
    }
    return true;
}

/**
 * Get last failed payment
 */
async function getLastFailedPayment() {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest('/api/payments/last-failed');
        return response;
    } catch (error) {
        console.error('Error getting last failed payment:', error);
        return null;
    }
}

/**
 * Retry failed payment
 */
async function retryFailedPayment(paymentId) {
    try {
        const payment = await getLastFailedPayment();
        if (payment && payment.id === paymentId) {
            return await processPayment(payment.amount);
        }
    } catch (error) {
        console.error('Error retrying payment:', error);
        throw error;
    }
}

/**
 * Handle payment webhook (for server-to-server communication)
 * This would typically be handled by your backend
 */
function handlePaymentWebhook(webhookData) {
    // ADJUST ACCORDING TO YOUR WEBHOOK STRUCTURE
    const { event, payload } = webhookData;

    switch (event) {
        case 'order.paid':
            console.log('Order paid:', payload);
            // Update order status
            break;
        case 'payment.captured':
            console.log('Payment captured:', payload);
            break;
        case 'payment.failed':
            console.log('Payment failed:', payload);
            showToast('Payment failed. Please try again.', 'error');
            break;
        case 'refund.created':
            console.log('Refund created:', payload);
            break;
        default:
            console.log('Unknown webhook event:', event);
    }
}

/**
 * Payment flow for checkout page
 */
async function handleCheckoutPayment() {
    const paymentBtn = document.getElementById('paymentBtn');
    if (!paymentBtn) return;

    paymentBtn.disabled = true;
    paymentBtn.textContent = 'Processing...';

    try {
        // Get order total from session storage
        const orderTotal = sessionStorage.getItem('orderTotal') || '0';
        const amountInPaise = formatAmountForRazorpay(parseFloat(orderTotal));

        // Validate amount
        if (!validatePaymentAmount(orderTotal)) {
            throw new Error('Invalid payment amount');
        }

        // Get user info
        const user = getCurrentUser();
        const deliveryForm = document.getElementById('deliveryForm');
        const phoneNumber = deliveryForm ? deliveryForm.phone?.value : user?.phone || '';

        // Process payment
        const result = await processPayment(amountInPaise, {
            name: user?.name || deliveryForm?.fullName?.value || '',
            email: user?.email || deliveryForm?.email?.value || '',
            phone: phoneNumber
        });

        if (result.success) {
            // Clear cart
            clearCart();
            
            showToast('Payment successful!', 'success');
            
            // Redirect to orders page
            setTimeout(() => navigateTo('orders.html'), 1500);
        }
    } catch (error) {
        console.error('Payment error:', error);
        showToast(error.message || 'Payment failed. Please try again.', 'error');
    } finally {
        paymentBtn.disabled = false;
        paymentBtn.textContent = `Pay ₹${sessionStorage.getItem('orderTotal') || '0'} with Razorpay`;
    }
}

// Initialize payment system on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeRazorpay();
    });
}
