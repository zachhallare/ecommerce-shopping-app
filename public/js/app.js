/**
 * E-Commerce Admin Frontend
 * Main application logic using Handlebars.js for templating
 */

// ========================================
// Configuration
// ========================================
const API_BASE_URL = '/api';

// ========================================
// State Management
// ========================================
const state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    products: [],
    currentProduct: null,
    productToDelete: null
};

// ========================================
// Handlebars Helpers
// ========================================
Handlebars.registerHelper('truncate', function (text, length) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
});

Handlebars.registerHelper('formatPrice', function (price) {
    if (price === undefined || price === null) return '0.00';
    return Number(price).toFixed(2);
});

// ========================================
// Template Compilation
// ========================================
const templates = {
    productCard: null,
    productDetail: null
};

function compileTemplates() {
    const productCardSource = document.getElementById('product-card-template').innerHTML;
    templates.productCard = Handlebars.compile(productCardSource);

    const productDetailSource = document.getElementById('product-detail-template').innerHTML;
    templates.productDetail = Handlebars.compile(productDetailSource);
}

// ========================================
// API Helpers
// ========================================
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (state.token) {
        headers['token'] = `Bearer ${state.token}`;
    }
    return headers;
}

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: getAuthHeaders(),
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ========================================
// Authentication
// ========================================
async function login(username, password) {
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        state.token = data.accessToken;
        state.user = data;

        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data));

        updateAuthUI();
        closeModal('login-modal');
        showAlert('Login successful!', 'success');
        loadProducts();

        return data;
    } catch (error) {
        throw error;
    }
}

function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateAuthUI();
    loadProducts();
    showAlert('Logged out successfully', 'success');
}

function updateAuthUI() {
    const authStatus = document.getElementById('auth-status');
    const addProductBtn = document.getElementById('add-product-btn');

    if (state.user && state.user.isAdmin) {
        const initial = state.user.username ? state.user.username.charAt(0).toUpperCase() : 'A';
        authStatus.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${initial}</div>
                <span>${state.user.username || 'Admin'}</span>
            </div>
            <button class="btn btn-secondary" id="logout-btn">Logout</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', logout);
        addProductBtn.style.display = 'inline-flex';
    } else {
        authStatus.innerHTML = `
            <button class="btn btn-primary" id="login-btn">Login</button>
        `;
        document.getElementById('login-btn').addEventListener('click', () => openModal('login-modal'));
        addProductBtn.style.display = 'none';
    }
}

// ========================================
// Products CRUD
// ========================================
async function loadProducts() {
    const container = document.getElementById('products-container');
    const loading = document.getElementById('products-loading');
    const empty = document.getElementById('products-empty');

    loading.style.display = 'flex';
    container.innerHTML = '';
    empty.style.display = 'none';

    try {
        const products = await apiRequest('/products');
        state.products = products;

        loading.style.display = 'none';

        if (products.length === 0) {
            empty.style.display = 'block';
        } else {
            const html = templates.productCard({
                products: products,
                isAdmin: state.user && state.user.isAdmin
            });
            container.innerHTML = html;
            attachProductEventListeners();
        }
    } catch (error) {
        loading.style.display = 'none';
        showAlert('Failed to load products. Please login as admin.', 'error');
    }
}

async function loadProduct(id) {
    try {
        const product = await apiRequest(`/products/find/${id}`);
        state.currentProduct = product;

        const html = templates.productDetail(product);
        document.getElementById('product-detail-container').innerHTML = html;
        document.getElementById('product-modal-title').textContent = product.title;
        openModal('product-modal');
    } catch (error) {
        showAlert('Failed to load product details', 'error');
    }
}

async function createProduct(productData) {
    try {
        await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });

        closeModal('product-form-modal');
        showAlert('Product created successfully!', 'success');
        loadProducts();
    } catch (error) {
        showAlert('Failed to create product: ' + error.message, 'error');
    }
}

async function updateProduct(id, productData) {
    try {
        await apiRequest(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });

        closeModal('product-form-modal');
        showAlert('Product updated successfully!', 'success');
        loadProducts();
    } catch (error) {
        showAlert('Failed to update product: ' + error.message, 'error');
    }
}

async function deleteProduct(id) {
    try {
        await apiRequest(`/products/${id}`, {
            method: 'DELETE'
        });

        closeModal('delete-modal');
        showAlert('Product deleted successfully!', 'success');
        loadProducts();
    } catch (error) {
        showAlert('Failed to delete product: ' + error.message, 'error');
    }
}

// ========================================
// Modal Helpers
// ========================================
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// ========================================
// Alert Helper
// ========================================
function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert show ${type}`;

    setTimeout(() => {
        alert.classList.remove('show');
    }, 4000);
}

// ========================================
// Form Helpers
// ========================================
function openProductForm(product = null) {
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-form-title');

    form.reset();

    if (product) {
        title.textContent = 'Edit Product';
        document.getElementById('product-id').value = product._id;
        document.getElementById('product-title').value = product.title || '';
        document.getElementById('product-desc').value = product.desc || '';
        document.getElementById('product-img').value = product.img || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-categories').value = product.categories ? product.categories.join(', ') : '';
        document.getElementById('product-size').value = product.size || '';
        document.getElementById('product-color').value = product.color || '';
    } else {
        title.textContent = 'Add Product';
        document.getElementById('product-id').value = '';
    }

    openModal('product-form-modal');
}

function getFormData() {
    const categories = document.getElementById('product-categories').value;

    return {
        title: document.getElementById('product-title').value.trim(),
        desc: document.getElementById('product-desc').value.trim(),
        img: document.getElementById('product-img').value.trim(),
        price: parseFloat(document.getElementById('product-price').value),
        categories: categories ? categories.split(',').map(c => c.trim()) : [],
        size: document.getElementById('product-size').value.trim() || undefined,
        color: document.getElementById('product-color').value.trim() || undefined
    };
}

// ========================================
// Event Listeners
// ========================================
function attachProductEventListeners() {
    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            loadProduct(id);
        });
    });

    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            const product = state.products.find(p => p._id === id);
            if (product) {
                openProductForm(product);
            }
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            state.productToDelete = id;
            openModal('delete-modal');
        });
    });
}

function initEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');

        try {
            errorEl.textContent = '';
            await login(username, password);
        } catch (error) {
            errorEl.textContent = error.message || 'Login failed';
        }
    });

    // Login modal close
    document.getElementById('login-modal-close').addEventListener('click', () => closeModal('login-modal'));
    document.getElementById('login-btn')?.addEventListener('click', () => openModal('login-modal'));

    // Product modal close
    document.getElementById('product-modal-close').addEventListener('click', () => closeModal('product-modal'));

    // Product form modal
    document.getElementById('add-product-btn').addEventListener('click', () => openProductForm());
    document.getElementById('product-form-modal-close').addEventListener('click', () => closeModal('product-form-modal'));
    document.getElementById('cancel-product-btn').addEventListener('click', () => closeModal('product-form-modal'));

    // Product form submission
    document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('product-id').value;
        const data = getFormData();

        if (id) {
            await updateProduct(id, data);
        } else {
            await createProduct(data);
        }
    });

    // Delete modal
    document.getElementById('delete-modal-close').addEventListener('click', () => closeModal('delete-modal'));
    document.getElementById('cancel-delete-btn').addEventListener('click', () => closeModal('delete-modal'));
    document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
        if (state.productToDelete) {
            await deleteProduct(state.productToDelete);
            state.productToDelete = null;
        }
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', closeAllModals);
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    compileTemplates();
    initEventListeners();
    updateAuthUI();
    loadProducts();
});
