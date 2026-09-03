/* ============================================
   PRODUCTS PAGE FUNCTIONALITY
   Product Listing, Filtering, & Search
   ============================================ */

let allProducts = [];
let filteredProducts = [];

/**
 * Load all products from backend
 */
async function loadProducts() {
    try {
        // ADJUST ACCORDING TO ACTUAL BACKEND ENDPOINT
        const products = await apiRequest('/api/products');

        if (products && Array.isArray(products)) {
            allProducts = products;
            filteredProducts = [...allProducts];
            
            // Populate categories filter
            populateCategoryFilter();
            
            // Display products
            displayProducts();
        } else {
            showEmptyState('No products available');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showEmptyState('Failed to load products');
        showToast('Failed to load products', 'error');
    }
}

/**
 * Populate category filter dropdown
 */
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;

    // Get unique categories
    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

/**
 * Filter and display products based on search, category, and sort
 */
function filterAndDisplayProducts() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;

    filteredProducts = allProducts.filter(product => {
        // ADJUST FIELD NAMES ACCORDING TO ACTUAL BACKEND RESPONSE
        const {
            name = '',
            description = '',
            category = '',
            price = 0
        } = product;

        const matchesSearch = name.toLowerCase().includes(searchQuery) ||
                            description.toLowerCase().includes(searchQuery);
        const matchesCategory = !categoryFilter || category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    sortAndDisplayProducts();
}

/**
 * Sort and display products
 */
function sortAndDisplayProducts() {
    const sortValue = document.getElementById('sortFilter').value;

    if (sortValue === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'newest') {
        // Assuming newer items have higher ID or date
        filteredProducts.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    displayProducts();
}

/**
 * Display products in grid
 */
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) return;

    if (filteredProducts.length === 0) {
        showEmptyState('No products found matching your search');
        return;
    }

    showProducts();
    productsGrid.innerHTML = '';

    filteredProducts.forEach(product => {
        // ADJUST FIELD NAMES ACCORDING TO ACTUAL BACKEND RESPONSE
        const {
            id = '',
            name = 'Product',
            price = 0,
            description = '',
            sellerName = 'Seller',
            category = 'Category',
            stock = 0
        } = product;

        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="20" y="30" width="160" height="140" rx="8"/>
                    <circle cx="100" cy="80" r="15" opacity="0.3"/>
                    <path d="M 20 140 L 80 80 L 140 110 L 180 60" opacity="0.3"/>
                </svg>
            </div>

            <div class="product-body">
                <span class="product-category">${escapeHtml(category)}</span>
                <h3 class="product-name">${escapeHtml(name)}</h3>
                <p class="product-description">${escapeHtml(description.substring(0, 80))}${description.length > 80 ? '...' : ''}</p>
                
                <div class="product-meta">
                    <span class="product-seller">${escapeHtml(sellerName)}</span>
                    <span style="color: ${stock > 0 ? 'var(--success)' : 'var(--danger)'}; font-weight: 600; font-size: 0.875rem;">
                        ${stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>

                <div class="product-price">₹${price.toLocaleString('en-IN')}</div>

                <div class="product-actions">
                    <button class="btn btn-primary" onclick="viewProductDetails('${id}')">
                        View Details
                    </button>
                    <button class="btn btn-secondary" onclick="addToCartDirect('${id}', ${price})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

        productsGrid.appendChild(productCard);
    });
}

/**
 * View product details
 */
function viewProductDetails(productId) {
    navigateWithParams('product-details.html', { id: productId });
}

/**
 * Add product directly to cart from products list
 */
function addToCartDirect(productId, price) {
    if (!isLoggedIn()) {
        showToast('Please login to add items to cart', 'warning');
        setTimeout(() => navigateTo('login.html'), 1000);
        return;
    }

    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                quantity: 1,
                price: price
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        showToast('Added to cart', 'success');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add to cart', 'error');
    }
}

/**
 * Search with debounce
 */
const debouncedSearch = debounce(() => {
    filterAndDisplayProducts();
}, 300);

/**
 * Handle search input
 */
function handleSearchChange() {
    debouncedSearch();
}

/**
 * Handle filter change
 */
function handleFilterChange() {
    filterAndDisplayProducts();
}

/**
 * Handle sort change
 */
function handleSortChange() {
    sortAndDisplayProducts();
}
