/* ============================================
   NEGOTIATION FUNCTIONALITY
   Price Negotiation with Sellers
   ============================================ */

let currentNegotiationId = null;
let negotiationHistory = [];

/**
 * Load negotiation history for a product
 */
async function loadNegotiationHistory(productId) {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const negotiations = await apiRequest(`/api/negotiations/product/${productId}`);

        if (negotiations && Array.isArray(negotiations)) {
            negotiationHistory = negotiations;
            
            if (negotiations.length > 0) {
                const activeNegotiation = negotiations[negotiations.length - 1];
                currentNegotiationId = activeNegotiation.id;
                displayNegotiationThread();
            } else {
                showPriceProposalForm();
            }
        } else {
            showPriceProposalForm();
        }
    } catch (error) {
        console.error('Error loading negotiation history:', error);
        showPriceProposalForm();
    }
}

/**
 * Submit price proposal
 */
async function submitProposal(productId, proposedPrice, message) {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest('/api/negotiations/create', {
            method: 'POST',
            body: JSON.stringify({
                productId: productId,
                proposedPrice: parseInt(proposedPrice),
                message: message
            })
        });

        // ADJUST ACCORDING TO ACTUAL BACKEND RESPONSE
        if (response.negotiationId) {
            currentNegotiationId = response.negotiationId;
            negotiationHistory.push(response);
            
            showToast('Proposal submitted! Waiting for seller response...', 'success');
            
            // Reload negotiation thread after a delay
            setTimeout(() => {
                loadNegotiationHistory(productId);
            }, 2000);

            return true;
        }
    } catch (error) {
        console.error('Error submitting proposal:', error);
        showToast(error.message || 'Failed to submit proposal', 'error');
        return false;
    }
}

/**
 * Display negotiation thread/conversation
 */
function displayNegotiationThread() {
    const threadContainer = document.getElementById('negotiationThread');
    const messagesList = document.getElementById('messagesList');

    if (!threadContainer || !messagesList) return;

    if (negotiationHistory.length === 0) {
        threadContainer.style.display = 'none';
        return;
    }

    threadContainer.style.display = 'block';
    messagesList.innerHTML = '';

    negotiationHistory.forEach((negotiation, index) => {
        // ADJUST FIELD NAMES ACCORDING TO ACTUAL BACKEND RESPONSE
        const {
            id = '',
            proposedPrice = 0,
            sellerResponse = '',
            status = 'pending',
            message = '',
            createdAt = new Date().toISOString(),
            updatedAt = new Date().toISOString()
        } = negotiation;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'negotiation-message';
        messageDiv.innerHTML = `
            <div class="message-user">
                <div class="user-avatar">You</div>
                <div class="message-content">
                    <p class="message-text">Proposed Price: <strong>₹${proposedPrice.toLocaleString('en-IN')}</strong></p>
                    ${message ? `<p class="message-note">${escapeHtml(message)}</p>` : ''}
                    <small class="message-time">${formatDateTime(createdAt)}</small>
                </div>
            </div>
        `;
        messagesList.appendChild(messageDiv);

        // If seller has responded, show seller response
        if (sellerResponse || status !== 'pending') {
            const sellerMessageDiv = document.createElement('div');
            sellerMessageDiv.className = 'negotiation-message seller';
            sellerMessageDiv.innerHTML = `
                <div class="message-seller">
                    <div class="seller-avatar">Seller</div>
                    <div class="message-content">
                        <p class="message-text">${escapeHtml(sellerResponse || 'Awaiting response...')}</p>
                        <span class="status-badge ${getStatusClass(status)}">${escapeHtml(status)}</span>
                        <small class="message-time">${formatDateTime(updatedAt)}</small>
                    </div>
                </div>
            `;
            messagesList.appendChild(sellerMessageDiv);
        }
    });

    // Show action buttons if there's an active offer
    const lastNegotiation = negotiationHistory[negotiationHistory.length - 1];
    if (lastNegotiation && lastNegotiation.status === 'approved') {
        document.getElementById('actionButtons').style.display = 'block';
    }
}

/**
 * Accept negotiated offer
 */
function acceptOffer() {
    const currentPrice = document.getElementById('currentPrice').textContent.replace(/₹|,/g, '');
    const productId = sessionStorage.getItem('negotiationProductId');

    if (!currentPrice || !productId) {
        showToast('Error processing offer', 'error');
        return;
    }

    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.price = parseInt(currentPrice);
        } else {
            cart.push({
                id: productId,
                quantity: 1,
                price: parseInt(currentPrice)
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        
        showToast('Added to cart with negotiated price!', 'success');
        setTimeout(() => navigateTo('cart.html'), 1500);
    } catch (error) {
        console.error('Error accepting offer:', error);
        showToast('Failed to add to cart', 'error');
    }
}

/**
 * Continue negotiating
 */
function continueNegotiating() {
    const form = document.getElementById('priceProposalForm');
    if (form) {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('proposedPrice').value = '';
        document.getElementById('message').value = '';
    }
}

/**
 * Get status class for CSS styling
 */
function getStatusClass(status) {
    const statusMap = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-cancelled',
        'counter': 'status-processing'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
}

/**
 * Show price proposal form
 */
function showPriceProposalForm() {
    const form = document.getElementById('priceProposalForm');
    if (form) {
        form.style.display = 'block';
    }
}

/**
 * Show negotiation status
 */
function showNegotiationStatus() {
    const status = document.getElementById('negotiationStatus');
    if (status) {
        status.style.display = 'block';
    }
}

/**
 * Styles for negotiation messages (add to head or CSS file)
 */
const negotiationStyles = `
    <style>
        .negotiation-message {
            margin-bottom: var(--spacing-lg);
            padding: var(--spacing-md);
            background-color: var(--bg-secondary);
            border-radius: var(--radius-md);
        }

        .negotiation-message.seller {
            background-color: rgba(0, 102, 204, 0.05);
            border-left: 3px solid var(--accent-blue);
        }

        .message-user,
        .message-seller {
            display: flex;
            gap: var(--spacing-md);
        }

        .user-avatar,
        .seller-avatar {
            width: 40px;
            height: 40px;
            background-color: var(--accent-blue);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            flex-shrink: 0;
            font-size: 0.75rem;
        }

        .message-content {
            flex-grow: 1;
        }

        .message-text {
            margin-bottom: var(--spacing-sm);
            font-weight: 500;
        }

        .message-note {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-bottom: var(--spacing-sm);
        }

        .message-time {
            color: var(--text-secondary);
            font-size: 0.75rem;
        }
    </style>
`;
