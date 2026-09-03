/* ============================================
   ADMIN FUNCTIONALITY
   Product & User Management
   ============================================ */

/**
 * Load admin statistics/dashboard data
 */
async function loadAdminStatistics() {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINTS
        const [totalUsers, totalProducts, totalOrders, pendingNegotiations] = await Promise.all([
            apiRequest('/api/admin/statistics/users').catch(() => ({ count: 0 })),
            apiRequest('/api/admin/statistics/products').catch(() => ({ count: 0 })),
            apiRequest('/api/admin/statistics/orders').catch(() => ({ count: 0 })),
            apiRequest('/api/admin/statistics/negotiations').catch(() => ({ count: 0 }))
        ]);

        // Update dashboard
        const stats = {
            users: totalUsers.count || 0,
            products: totalProducts.count || 0,
            orders: totalOrders.count || 0,
            negotiations: pendingNegotiations.count || 0
        };

        updateStatisticsDisplay(stats);
        return stats;
    } catch (error) {
        console.error('Error loading admin statistics:', error);
        return null;
    }
}

/**
 * Update statistics display on dashboard
 */
function updateStatisticsDisplay(stats) {
    document.getElementById('totalUsers').textContent = stats.users || '0';
    document.getElementById('totalProducts').textContent = stats.products || '0';
    document.getElementById('totalOrders').textContent = stats.orders || '0';
    document.getElementById('pendingNegotiations').textContent = stats.negotiations || '0';
}

/**
 * Load all products for admin
 */
async function loadAdminProducts() {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const products = await apiRequest('/api/admin/products');

        if (products && Array.isArray(products)) {
            displayAdminProductsList(products);
            return products;
        }
    } catch (error) {
        console.error('Error loading admin products:', error);
        showToast('Failed to load products', 'error');
        return [];
    }
}

/**
 * Display products list in admin
 */
function displayAdminProductsList(products) {
    const list = document.getElementById('productsList');
    if (!list) return;

    if (products.length === 0) {
        list.innerHTML = '<p class="empty-message">No products found</p>';
        return;
    }

    list.innerHTML = '';

    products.forEach(product => {
        // ADJUST FIELD NAMES ACCORDING TO ACTUAL BACKEND RESPONSE
        const {
            id = '',
            name = 'Product',
            price = 0,
            stock = 0,
            category = '',
            description = '',
            createdAt = new Date().toISOString()
        } = product;

        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
            <div class="item-info">
                <h3>${escapeHtml(name)}</h3>
                <p>${escapeHtml(category || 'Uncategorized')}</p>
            </div>
            <div class="item-details">
                <span class="detail">₹${price.toLocaleString()}</span>
                <span class="detail">Stock: ${stock}</span>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-secondary" onclick="openEditProductForm('${id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteAdminProduct('${id}')">Delete</button>
            </div>
        `;

        list.appendChild(item);
    });
}

/**
 * Open add product form
 */
function openAddProductForm() {
    const form = document.getElementById('productForm');
    if (form) {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('addProductForm').reset();
    }
}

/**
 * Hide product form
 */
function closeProductForm() {
    const form = document.getElementById('productForm');
    if (form) {
        form.style.display = 'none';
    }
}

/**
 * Add new product
 */
async function addNewProduct(formData) {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest('/api/admin/products', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        if (response.id) {
            showToast('Product added successfully', 'success');
            closeProductForm();
            await loadAdminProducts();
            return true;
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showToast(error.message || 'Failed to add product', 'error');
        return false;
    }
}

/**
 * Open edit product form
 */
async function openEditProductForm(productId) {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const product = await apiRequest(`/api/admin/products/${productId}`);

        if (product) {
            const form = document.getElementById('addProductForm');
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productStock').value = product.stock || '';
            document.getElementById('productDescription').value = product.description || '';

            // Store ID for update
            form.dataset.productId = productId;

            const formContainer = document.getElementById('productForm');
            if (formContainer) {
                formContainer.style.display = 'block';
                formContainer.scrollIntoView({ behavior: 'smooth' });
                const heading = formContainer.querySelector('h3');
                if (heading) heading.textContent = 'Edit Product';
            }
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Failed to load product details', 'error');
    }
}

/**
 * Update product
 */
async function updateProduct(productId, formData) {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest(`/api/admin/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });

        if (response.success || response.id) {
            showToast('Product updated successfully', 'success');
            closeProductForm();
            await loadAdminProducts();
            return true;
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showToast(error.message || 'Failed to update product', 'error');
        return false;
    }
}

/**
 * Delete product
 */
async function deleteAdminProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return false;
    }

    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest(`/api/admin/products/${productId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showToast('Product deleted successfully', 'success');
            await loadAdminProducts();
            return true;
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast(error.message || 'Failed to delete product', 'error');
        return false;
    }
}

/**
 * Load all users for admin
 */
async function loadAdminUsers() {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const users = await apiRequest('/api/admin/users');

        if (users && Array.isArray(users)) {
            displayAdminUsersList(users);
            return users;
        }
    } catch (error) {
        console.error('Error loading admin users:', error);
        showToast('Failed to load users', 'error');
        return [];
    }
}

/**
 * Display users list in admin
 */
function displayAdminUsersList(users) {
    const list = document.getElementById('usersList');
    if (!list) return;

    if (users.length === 0) {
        list.innerHTML = '<p class="empty-message">No users found</p>';
        return;
    }

    list.innerHTML = '';

    users.forEach(user => {
        // ADJUST FIELD NAMES ACCORDING TO ACTUAL BACKEND RESPONSE
        const {
            id = '',
            name = 'User',
            email = '',
            role = 'user',
            createdAt = new Date().toISOString()
        } = user;

        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
            <div class="item-info">
                <h3>${escapeHtml(name)}</h3>
                <p>${escapeHtml(email)}</p>
            </div>
            <div class="item-details">
                <span class="detail">${escapeHtml(role.toUpperCase())}</span>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-secondary" onclick="viewUserDetails('${id}')">View</button>
                ${role !== 'admin' ? `
                    <button class="btn btn-sm btn-secondary" onclick="promoteToAdmin('${id}')">Make Admin</button>
                ` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteAdminUser('${id}')">Delete</button>
            </div>
        `;

        list.appendChild(item);
    });
}

/**
 * View user details
 */
async function viewUserDetails(userId) {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const user = await apiRequest(`/api/admin/users/${userId}`);

        if (user) {
            showUserModal(user);
        }
    } catch (error) {
        console.error('Error loading user details:', error);
        showToast('Failed to load user details', 'error');
    }
}

/**
 * Show user details modal
 */
function showUserModal(user) {
    const modal = document.createElement('div');
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

    modal.innerHTML = `
        <div style="background-color: var(--bg-primary); border-radius: var(--radius-lg); max-width: 500px; width: 90%; box-shadow: var(--shadow-lg); padding: var(--spacing-lg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <h2 style="margin-bottom: 0;">${escapeHtml(user.name)}</h2>
                <button onclick="this.closest('div').parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
            </div>

            <div style="background-color: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg);">
                <p style="margin-bottom: var(--spacing-sm);"><strong>Email:</strong> ${escapeHtml(user.email)}</p>
                <p style="margin-bottom: var(--spacing-sm);"><strong>Role:</strong> ${escapeHtml(user.role.toUpperCase())}</p>
                <p style="margin-bottom: var(--spacing-sm);"><strong>Joined:</strong> ${formatDate(user.createdAt)}</p>
                ${user.phone ? `<p style="margin-bottom: var(--spacing-sm);"><strong>Phone:</strong> ${escapeHtml(user.phone)}</p>` : ''}
            </div>

            <button class="btn btn-primary btn-block" onclick="this.closest('div').parentElement.remove()">Close</button>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Promote user to admin
 */
async function promoteToAdmin(userId) {
    if (!confirm('Are you sure you want to make this user an admin?')) {
        return false;
    }

    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest(`/api/admin/users/${userId}/promote`, {
            method: 'POST'
        });

        if (response.success) {
            showToast('User promoted to admin', 'success');
            await loadAdminUsers();
            return true;
        }
    } catch (error) {
        console.error('Error promoting user:', error);
        showToast('Failed to promote user', 'error');
        return false;
    }
}

/**
 * Delete user
 */
async function deleteAdminUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return false;
    }

    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showToast('User deleted successfully', 'success');
            await loadAdminUsers();
            return true;
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Failed to delete user', 'error');
        return false;
    }
}

/**
 * Load orders for admin
 */
async function loadAdminOrders() {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const orders = await apiRequest('/api/admin/orders');

        if (orders && Array.isArray(orders)) {
            displayAdminOrdersList(orders);
            return orders;
        }
    } catch (error) {
        console.error('Error loading admin orders:', error);
        showToast('Failed to load orders', 'error');
        return [];
    }
}

/**
 * Display orders list in admin
 */
function displayAdminOrdersList(orders) {
    const list = document.getElementById('ordersList');
    if (!list) return;

    if (orders.length === 0) {
        list.innerHTML = '<p class="empty-message">No orders found</p>';
        return;
    }

    list.innerHTML = '';

    orders.forEach(order => {
        // ADJUST FIELD NAMES ACCORDING TO ACTUAL BACKEND RESPONSE
        const {
            id = '',
            userId = '',
            orderDate = new Date().toISOString(),
            status = 'pending',
            totalAmount = 0
        } = order;

        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
            <div class="item-info">
                <h3>Order #${escapeHtml(id)}</h3>
                <p>User: ${escapeHtml(userId)}</p>
            </div>
            <div class="item-details">
                <span class="detail">${formatDate(orderDate)}</span>
                <span class="detail status-badge ${getOrderStatusClass(status)}">${escapeHtml(status)}</span>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-secondary" onclick="viewAdminOrderDetails('${id}')">View</button>
            </div>
        `;

        list.appendChild(item);
    });
}

/**
 * View order details in admin
 */
async function viewAdminOrderDetails(orderId) {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const order = await apiRequest(`/api/admin/orders/${orderId}`);

        if (order) {
            showOrderDetailsModal(order);
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showToast('Failed to load order details', 'error');
    }
}

/**
 * Update order status
 */
async function updateOrderStatus(orderId, newStatus) {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest(`/api/admin/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });

        if (response.success) {
            showToast('Order status updated', 'success');
            return true;
        }
    } catch (error) {
        console.error('Error updating order:', error);
        showToast('Failed to update order', 'error');
        return false;
    }
}

/**
 * Export data (products, users, orders)
 */
async function exportData(type) {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const response = await apiRequest(`/api/admin/export/${type}`);

        if (response) {
            // Download as JSON file
            const dataStr = JSON.stringify(response, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${type}_export_${Date.now()}.json`;
            link.click();
            showToast('Data exported successfully', 'success');
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        showToast('Failed to export data', 'error');
    }
}
