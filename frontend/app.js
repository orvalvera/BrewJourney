// ===== BrewJourney - Frontend Application =====

const API_URL = 'http://localhost:3000/api';

// ===== Estado de la Aplicación =====
const state = {
    user: {
        id: 'u1',
        name: 'Samuel Orval',
        email: 'orval@brewjourney.com'
    },
    cafes: [],
    orders: [],
    stamps: [],
    currentReview: {
        rating: 0,
        text: '',
        tags: [],
        history: [],
        historyIndex: -1
    },
    customBeverage: {
        baseName: 'Cappuccino',
        basePrice: 4.50,
        size: 'medium',
        extras: []
    }
};

// ===== Datos de Ejemplo (cuando no hay backend) =====
const mockData = {
    cafes: [
        {
            id: 'c1',
            name: 'Starbucks',
            location: 'Av. Temozon Norte #123',
            image: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400',
            rating: 4.5,
            stamps: 5
        },
        {
            id: 'c2',
            name: 'The Italian Coffee',
            location: 'Plaza Altabrisa Local 45',
            image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
            rating: 4.8,
            stamps: 3
        },
        {
            id: 'c3',
            name: 'Café Punta del Cielo',
            location: 'Centro Histórico #78',
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
            rating: 4.2,
            stamps: 2
        },
        {
            id: 'c4',
            name: 'Cielito Querido',
            location: 'Plaza Fiesta Local 12',
            image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
            rating: 4.6,
            stamps: 2
        }
    ],
    orders: [
        {
            id: 'dine-in_001',
            cafe: { id: 'c1', name: 'Starbucks' },
            products: [
                { name: 'Cappuccino', price: 4.50 },
                { name: 'Croissant', price: 3.00 }
            ],
            total: 7.50,
            status: 'completed',
            date: '2026-02-24'
        },
        {
            id: 'takeout_002',
            cafe: { id: 'c2', name: 'The Italian Coffee' },
            products: [
                { name: 'Latte', price: 4.00 },
                { name: 'Tiramisu', price: 6.00 }
            ],
            total: 10.00,
            status: 'completed',
            date: '2026-02-23'
        }
    ],
    products: [
        { id: 'p1', name: 'Cappuccino', price: 4.50, type: 'beverage', icon: 'fa-mug-hot' },
        { id: 'p2', name: 'Latte', price: 4.00, type: 'beverage', icon: 'fa-mug-hot' },
        { id: 'p3', name: 'Espresso', price: 2.50, type: 'beverage', icon: 'fa-mug-hot' },
        { id: 'p4', name: 'Americano', price: 3.00, type: 'beverage', icon: 'fa-mug-hot' },
        { id: 'p5', name: 'Croissant', price: 3.00, type: 'snack', icon: 'fa-cookie' },
        { id: 'p6', name: 'Tiramisu', price: 6.00, type: 'dessert', icon: 'fa-cake-candles' },
        { id: 'p7', name: 'Cheesecake', price: 5.50, type: 'dessert', icon: 'fa-cake-candles' },
        { id: 'p8', name: 'Taza BJ', price: 15.00, type: 'merchandise', icon: 'fa-mug-saucer' }
    ]
};

// ===== Inicialización =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        // Intentar cargar datos del backend
        await loadData();
    } catch (error) {
        console.log('Backend no disponible, usando datos mock');
        useMockData();
    }
    
    renderAll();
    setupEventListeners();
}

async function loadData() {
    const response = await fetch(`${API_URL}/cafes`);
    if (!response.ok) throw new Error('Backend not available');
    
    state.cafes = await response.json();
    
    const ordersRes = await fetch(`${API_URL}/orders`);
    state.orders = await ordersRes.json();
    
    const stampsRes = await fetch(`${API_URL}/stamps/${state.user.id}`);
    state.stamps = await stampsRes.json();
}

function useMockData() {
    state.cafes = mockData.cafes;
    state.orders = mockData.orders;
    state.stamps = mockData.cafes.flatMap(cafe => 
        Array(cafe.stamps).fill().map((_, i) => ({
            cafeId: cafe.id,
            cafeName: cafe.name,
            date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        }))
    );
}

// ===== Renderizado =====
function renderAll() {
    renderPassportPreview();
    renderStampsGrid();
    renderCafes();
    renderOrders();
    renderProductSelector();
    updateStats();
    updateProgress();
    updateCustomBeverage();
}

function renderPassportPreview() {
    const container = document.getElementById('passportPreview');
    const stamps = state.stamps.slice(0, 8);
    
    container.innerHTML = stamps.map(stamp => `
        <div class="stamp filled">
            <i class="fas fa-check"></i>
        </div>
    `).join('') + Array(8 - stamps.length).fill().map(() => `
        <div class="stamp">
            <i class="fas fa-coffee"></i>
        </div>
    `).join('');
}

function renderStampsGrid() {
    const container = document.getElementById('stampsGrid');
    
    container.innerHTML = state.stamps.map(stamp => `
        <div class="stamp-item">
            <div class="stamp-icon">
                <i class="fas fa-stamp"></i>
            </div>
            <span class="stamp-cafe">${stamp.cafeName}</span>
            <span class="stamp-date">${formatDate(stamp.date)}</span>
        </div>
    `).join('');
}

function renderCafes() {
    const container = document.getElementById('cafesGrid');
    const selectCafe = document.getElementById('orderCafe');
    
    container.innerHTML = state.cafes.map(cafe => `
        <div class="cafe-card">
            <div class="cafe-image" style="background-image: url('${cafe.image}')">
                <div class="cafe-stamps">
                    <i class="fas fa-stamp"></i>
                    ${cafe.stamps} sellos
                </div>
            </div>
            <div class="cafe-info">
                <h3>${cafe.name}</h3>
                <div class="cafe-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${cafe.location}
                </div>
                <div class="cafe-rating">
                    ${renderStars(cafe.rating)}
                    <span>${cafe.rating}</span>
                </div>
                <div class="cafe-actions">
                    <button class="btn-visit" onclick="registerVisit('${cafe.id}')">
                        <i class="fas fa-stamp"></i> Registrar Visita
                    </button>
                    <button class="btn-review" onclick="openReviewModal('${cafe.id}')">
                        <i class="fas fa-star"></i> Reseña
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    selectCafe.innerHTML = '<option value="">Selecciona una cafetería</option>' +
        state.cafes.map(cafe => `
            <option value="${cafe.id}">${cafe.name}</option>
        `).join('');
}

function renderOrders() {
    const container = document.getElementById('ordersList');
    
    if (state.orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No tienes órdenes aún</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">#${order.id.slice(-6).toUpperCase()}</span>
                <span class="order-status ${order.status}">${order.status === 'completed' ? 'Completada' : 'Pendiente'}</span>
            </div>
            <div class="order-cafe">
                <i class="fas fa-store"></i>
                ${order.cafe?.name || 'Cafetería'}
            </div>
            <div class="order-products">
                ${order.products.map(p => `
                    <div class="order-product">
                        <span>${p.name}</span>
                        <span>$${p.price.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <span class="order-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(order.date || order.createdAt)}
                </span>
                <span class="order-total-amount">$${order.total.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

function renderProductSelector() {
    const container = document.getElementById('productsSelector');
    
    container.innerHTML = mockData.products.map(product => `
        <div class="product-option" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
            <i class="fas ${product.icon}"></i>
            <div class="name">${product.name}</div>
            <div class="price">$${product.price.toFixed(2)}</div>
        </div>
    `).join('');
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    
    return `
        ${'<i class="fas fa-star"></i>'.repeat(full)}
        ${half ? '<i class="fas fa-star-half-alt"></i>' : ''}
        ${'<i class="far fa-star"></i>'.repeat(empty)}
    `;
}

function updateStats() {
    document.getElementById('totalStamps').textContent = state.stamps.length;
    document.getElementById('totalCafes').textContent = new Set(state.stamps.map(s => s.cafeId)).size;
    document.getElementById('totalReviews').textContent = Math.floor(state.stamps.length * 0.7);
}

function updateProgress() {
    const current = state.stamps.length;
    const target = 15;
    const percentage = Math.min((current / target) * 100, 100);
    
    document.getElementById('progressFill').style.width = `${percentage}%`;
    document.getElementById('currentStamps').textContent = current;
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Navegación
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('href').substring(1);
            showSection(section);
        });
    });
    
    // Productos en orden
    document.getElementById('productsSelector').addEventListener('click', (e) => {
        const option = e.target.closest('.product-option');
        if (option) {
            option.classList.toggle('selected');
            updateOrderSummary();
        }
    });
    
    // Form de orden
    document.getElementById('newOrderForm').addEventListener('submit', handleNewOrder);
    
    // Star rating
    document.getElementById('starRating').addEventListener('click', (e) => {
        if (e.target.matches('i')) {
            const rating = parseInt(e.target.dataset.rating);
            setRating(rating);
        }
    });
    
    // Tags
    document.querySelectorAll('.tags-container .tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('selected');
            updateReviewState();
        });
    });
    
    // Review form
    document.getElementById('reviewForm').addEventListener('submit', handleReviewSubmit);
    
    // Undo/Redo
    document.getElementById('undoReview').addEventListener('click', undoReview);
    document.getElementById('redoReview').addEventListener('click', redoReview);
    
    // Review text change
    document.getElementById('reviewText').addEventListener('input', () => {
        saveReviewState();
        updateUndoRedoButtons();
    });
    
    // Beverage Customization (Decorator Pattern)
    setupCustomizeListeners();
}

// ===== Navegación =====
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section, .hero').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostrar la sección seleccionada
    if (sectionId === 'home') {
        document.querySelector('.hero').classList.remove('hidden');
    } else {
        document.getElementById(sectionId).classList.remove('hidden');
    }
    
    // Actualizar nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
    });
}

// ===== Acciones =====
async function registerVisit(cafeId) {
    const cafe = state.cafes.find(c => c.id === cafeId);
    
    try {
        const response = await fetch(`${API_URL}/stamps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: state.user.id,
                cafeId: cafeId,
                date: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showToast(result.message, 'success');
        }
    } catch (error) {
        // Modo offline - agregar localmente
        const newStamp = {
            cafeId: cafeId,
            cafeName: cafe.name,
            date: new Date().toISOString().split('T')[0]
        };
        
        state.stamps.push(newStamp);
        cafe.stamps++;
        
        showToast(`¡Sello agregado en ${cafe.name}!`, 'success');
    }
    
    renderAll();
}

function updateOrderSummary() {
    const selected = document.querySelectorAll('.product-option.selected');
    const itemsContainer = document.getElementById('orderItems');
    const totalElement = document.getElementById('orderTotal');
    
    let total = 0;
    let html = '';
    
    selected.forEach(option => {
        const name = option.dataset.name;
        const price = parseFloat(option.dataset.price);
        total += price;
        html += `<div class="order-product">
            <span>${name}</span>
            <span>$${price.toFixed(2)}</span>
        </div>`;
    });
    
    itemsContainer.innerHTML = html || '<p style="color: var(--text-light)">Selecciona productos</p>';
    totalElement.textContent = `$${total.toFixed(2)}`;
}

async function handleNewOrder(e) {
    e.preventDefault();
    
    const cafeId = document.getElementById('orderCafe').value;
    const selected = document.querySelectorAll('.product-option.selected');
    
    if (!cafeId) {
        showToast('Selecciona una cafetería', 'error');
        return;
    }
    
    if (selected.length === 0) {
        showToast('Selecciona al menos un producto', 'error');
        return;
    }
    
    const cafe = state.cafes.find(c => c.id === cafeId);
    const products = Array.from(selected).map(option => ({
        name: option.dataset.name,
        price: parseFloat(option.dataset.price)
    }));
    
    const total = products.reduce((sum, p) => sum + p.price, 0);
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: state.user.id,
                cafeId: cafeId,
                items: products,
                type: 'dine-in'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Agregar a estado local
            state.orders.unshift({
                id: result.order.id,
                cafe: { id: cafeId, name: cafe.name },
                products: products,
                total: total,
                status: 'completed',
                createdAt: new Date().toISOString()
            });
            
            showToast(result.message || '¡Orden creada exitosamente!', 'success');
        }
    } catch (error) {
        // Modo offline - agregar localmente
        state.orders.unshift({
            id: `order_${Date.now()}`,
            cafe: { id: cafeId, name: cafe.name },
            products: products,
            total: total,
            status: 'completed',
            createdAt: new Date().toISOString()
        });
        
        showToast('¡Orden creada (modo offline)!', 'success');
    }
    
    // Recargar sellos
    try {
        const stampsRes = await fetch(`${API_URL}/stamps/${state.user.id}`);
        state.stamps = await stampsRes.json();
    } catch (e) {
        // Offline
    }
    
    // Limpiar formulario
    selected.forEach(option => option.classList.remove('selected'));
    document.getElementById('orderCafe').value = '';
    updateOrderSummary();
    
    renderAll();
}

// ===== Modal de Reseñas =====
function openReviewModal(cafeId) {
    document.getElementById('reviewCafeId').value = cafeId;
    document.getElementById('reviewModal').classList.remove('hidden');
    resetReviewState();
}

function closeModal() {
    document.getElementById('reviewModal').classList.add('hidden');
}

function setRating(rating) {
    state.currentReview.rating = rating;
    
    document.querySelectorAll('#starRating i').forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
    
    saveReviewState();
}

function updateReviewState() {
    const tags = Array.from(document.querySelectorAll('.tags-container .tag.selected'))
        .map(tag => tag.dataset.tag);
    state.currentReview.tags = tags;
    saveReviewState();
}

function saveReviewState() {
    const currentState = {
        rating: state.currentReview.rating,
        text: document.getElementById('reviewText').value,
        tags: [...state.currentReview.tags]
    };
    
    // Eliminar estados futuros si estamos en medio del historial
    if (state.currentReview.historyIndex < state.currentReview.history.length - 1) {
        state.currentReview.history = state.currentReview.history.slice(0, state.currentReview.historyIndex + 1);
    }
    
    state.currentReview.history.push(currentState);
    state.currentReview.historyIndex = state.currentReview.history.length - 1;
    
    // Limitar historial
    if (state.currentReview.history.length > 10) {
        state.currentReview.history.shift();
        state.currentReview.historyIndex--;
    }
    
    updateUndoRedoButtons();
}

function undoReview() {
    if (state.currentReview.historyIndex > 0) {
        state.currentReview.historyIndex--;
        restoreReviewState();
    }
}

function redoReview() {
    if (state.currentReview.historyIndex < state.currentReview.history.length - 1) {
        state.currentReview.historyIndex++;
        restoreReviewState();
    }
}

function restoreReviewState() {
    const savedState = state.currentReview.history[state.currentReview.historyIndex];
    
    // Restaurar rating
    setRating(savedState.rating);
    
    // Restaurar texto
    document.getElementById('reviewText').value = savedState.text;
    
    // Restaurar tags
    document.querySelectorAll('.tags-container .tag').forEach(tag => {
        tag.classList.toggle('selected', savedState.tags.includes(tag.dataset.tag));
    });
    
    state.currentReview.tags = savedState.tags;
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    document.getElementById('undoReview').disabled = state.currentReview.historyIndex <= 0;
    document.getElementById('redoReview').disabled = state.currentReview.historyIndex >= state.currentReview.history.length - 1;
}

function resetReviewState() {
    state.currentReview = {
        rating: 0,
        text: '',
        tags: [],
        history: [],
        historyIndex: -1
    };
    
    document.getElementById('reviewText').value = '';
    document.querySelectorAll('#starRating i').forEach(star => star.classList.remove('active'));
    document.querySelectorAll('.tags-container .tag').forEach(tag => tag.classList.remove('selected'));
    
    updateUndoRedoButtons();
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    
    const cafeId = document.getElementById('reviewCafeId').value;
    const cafe = state.cafes.find(c => c.id === cafeId);
    
    if (state.currentReview.rating === 0) {
        showToast('Selecciona una calificación', 'error');
        return;
    }
    
    const review = {
        cafeId: cafeId,
        userId: state.user.id,
        rating: state.currentReview.rating,
        text: document.getElementById('reviewText').value,
        tags: state.currentReview.tags,
        date: new Date().toISOString()
    };
    
    try {
        await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review)
        });
    } catch (error) {
        // Modo offline
    }
    
    showToast(`¡Reseña publicada para ${cafe.name}!`, 'success');
    closeModal();
    resetReviewState();
}

// ===== Utilidades =====
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ===== Beverage Customization (Decorator Pattern) =====
function setupCustomizeListeners() {
    // Base beverage selection
    document.getElementById('baseBeverages')?.addEventListener('click', (e) => {
        const option = e.target.closest('.base-option');
        if (option) {
            document.querySelectorAll('.base-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            state.customBeverage.baseName = option.dataset.name;
            state.customBeverage.basePrice = parseFloat(option.dataset.price);
            updateCustomBeverage();
        }
    });
    
    // Size selection
    document.getElementById('sizeOptions')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.size-btn');
        if (btn) {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.customBeverage.size = btn.dataset.size;
            updateCustomBeverage();
        }
    });
    
    // Extras selection
    document.getElementById('extrasGrid')?.addEventListener('click', (e) => {
        const option = e.target.closest('.extra-option');
        if (option) {
            option.classList.toggle('selected');
            updateExtrasFromSelection();
            updateCustomBeverage();
        }
    });
}

function updateExtrasFromSelection() {
    const extras = [];
    document.querySelectorAll('.extra-option.selected').forEach(option => {
        const type = option.dataset.type;
        const extra = { type };
        
        if (type === 'milk') {
            extra.milkType = option.dataset.milkType;
        } else if (type === 'extraShot') {
            extra.shots = parseInt(option.dataset.shots);
        } else if (type === 'flavorSyrup') {
            extra.flavor = option.dataset.flavor;
        }
        
        extras.push(extra);
    });
    
    state.customBeverage.extras = extras;
}

async function updateCustomBeverage() {
    const { baseName, basePrice, size, extras } = state.customBeverage;
    
    try {
        const response = await fetch(`${API_URL}/beverages/customize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ baseName, basePrice, size, extras })
        });
        
        if (response.ok) {
            const result = await response.json();
            renderCustomizeResult(result);
        } else {
            // Fallback to local calculation
            renderCustomizeResultLocal();
        }
    } catch (error) {
        // Fallback to local calculation
        renderCustomizeResultLocal();
    }
}

function renderCustomizeResult(result) {
    // Update result name
    document.getElementById('resultName').textContent = result.name;
    
    // Update description
    document.getElementById('resultDescription').textContent = result.description;
    
    // Update breakdown
    const breakdownHtml = result.breakdown.map((item, index) => `
        <div class="breakdown-item" ${index === 0 ? 'style="font-weight: 600;"' : ''}>
            <span>${item.item}</span>
            <span>$${item.price.toFixed(2)}</span>
        </div>
    `).join('');
    document.getElementById('resultBreakdown').innerHTML = breakdownHtml;
    
    // Update total
    document.getElementById('resultTotal').textContent = `$${result.price.toFixed(2)}`;
    
    // Update decorator chain visualization
    renderDecoratorChain(result.decoratorChain);
}

function renderCustomizeResultLocal() {
    const { baseName, basePrice, size, extras } = state.customBeverage;
    
    let total = basePrice;
    const breakdown = [{ item: `${baseName} (${getSizeName(size)})`, price: basePrice }];
    const decorators = [`BaseBeverage("${baseName}", $${basePrice})`];
    const descriptions = [];
    
    extras.forEach(extra => {
        let extraPrice = 0;
        let extraName = '';
        let decoratorStr = '';
        
        switch (extra.type) {
            case 'milk':
                extraPrice = 0.75;
                extraName = `Leche de ${capitalize(extra.milkType)}`;
                decoratorStr = `MilkDecorator("${extra.milkType}")`;
                descriptions.push(`leche de ${extra.milkType}`);
                break;
            case 'extraShot':
                extraPrice = 0.80 * extra.shots;
                extraName = extra.shots > 1 ? `${extra.shots} Shots Extra` : 'Shot Extra';
                decoratorStr = `ExtraShotDecorator(${extra.shots})`;
                descriptions.push(`${extra.shots} shot${extra.shots > 1 ? 's' : ''} extra`);
                break;
            case 'whippedCream':
                extraPrice = 0.60;
                extraName = 'Crema Batida';
                decoratorStr = 'WhippedCreamDecorator()';
                descriptions.push('crema batida');
                break;
            case 'flavorSyrup':
                extraPrice = 0.50;
                extraName = `Jarabe ${capitalize(extra.flavor)}`;
                decoratorStr = `FlavorSyrupDecorator("${extra.flavor}")`;
                descriptions.push(`jarabe de ${extra.flavor}`);
                break;
            case 'sizeUpgrade':
                extraPrice = 1.00;
                extraName = 'Tamaño Extra';
                decoratorStr = 'SizeUpgradeDecorator()';
                descriptions.push('tamaño extra');
                break;
        }
        
        total += extraPrice;
        breakdown.push({ item: extraName, price: extraPrice });
        decorators.push(decoratorStr);
    });
    
    // Update result name
    document.getElementById('resultName').textContent = baseName;
    
    // Update description
    const desc = descriptions.length > 0 
        ? `${baseName} con ${descriptions.join(', ')}`
        : 'Bebida base sin extras';
    document.getElementById('resultDescription').textContent = desc;
    
    // Update breakdown
    const breakdownHtml = breakdown.map((item, index) => `
        <div class="breakdown-item" ${index === 0 ? 'style="font-weight: 600;"' : ''}>
            <span>${item.item}</span>
            <span>$${item.price.toFixed(2)}</span>
        </div>
    `).join('');
    document.getElementById('resultBreakdown').innerHTML = breakdownHtml;
    
    // Update total
    document.getElementById('resultTotal').textContent = `$${total.toFixed(2)}`;
    
    // Update decorator chain visualization
    renderDecoratorChain(decorators);
}

function renderDecoratorChain(chain) {
    const container = document.getElementById('chainVisual');
    
    const html = chain.map((item, index) => `
        <div class="chain-item ${index === 0 ? 'base' : 'decorator'}">
            ${index > 0 ? '↳ ' : ''}${item}
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function getSizeName(size) {
    const names = { small: 'Chico', medium: 'Mediano', large: 'Grande' };
    return names[size] || 'Mediano';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function addCustomBeverageToOrder() {
    const { baseName, basePrice, size, extras } = state.customBeverage;
    
    // Get the final product info
    let finalName = baseName;
    let finalPrice = basePrice;
    
    // Calculate total with extras
    extras.forEach(extra => {
        switch (extra.type) {
            case 'milk': finalPrice += 0.75; break;
            case 'extraShot': finalPrice += 0.80 * extra.shots; break;
            case 'whippedCream': finalPrice += 0.60; break;
            case 'flavorSyrup': finalPrice += 0.50; break;
            case 'sizeUpgrade': finalPrice += 1.00; break;
        }
    });
    
    // Create order item
    const orderItem = {
        name: `${finalName} Personalizado`,
        price: finalPrice,
        extras: extras.map(e => e.type).join(', ')
    };
    
    // Try to create order via API
    const cafeId = state.cafes.length > 0 ? state.cafes[0].id : 'c1';
    const cafe = state.cafes.find(c => c.id === cafeId) || { name: 'BrewJourney Café' };
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: state.user.id,
                cafeId: cafeId,
                items: [orderItem],
                type: 'dine-in'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            state.orders.unshift({
                id: result.order.id,
                cafe: { id: cafeId, name: cafe.name },
                products: [orderItem],
                total: finalPrice,
                status: 'completed',
                createdAt: new Date().toISOString()
            });
            
            showToast(`¡Bebida personalizada agregada! ${extras.length} decoradores aplicados`, 'success');
        }
    } catch (error) {
        // Offline mode
        state.orders.unshift({
            id: `custom_${Date.now()}`,
            cafe: { id: cafeId, name: cafe.name },
            products: [orderItem],
            total: finalPrice,
            status: 'completed',
            createdAt: new Date().toISOString()
        });
        
        showToast('¡Bebida personalizada agregada (modo offline)!', 'success');
    }
    
    // Reset customization
    document.querySelectorAll('.extra-option.selected').forEach(e => e.classList.remove('selected'));
    state.customBeverage.extras = [];
    
    renderAll();
    showSection('orders');
}

// Exponer funciones globalmente
window.showSection = showSection;
window.registerVisit = registerVisit;
window.openReviewModal = openReviewModal;
window.closeModal = closeModal;
window.addCustomBeverageToOrder = addCustomBeverageToOrder;
