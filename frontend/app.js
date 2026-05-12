// ===== BrewJourney - Frontend Application =====

const API_URL = 'http://localhost:3000/api';
const SESSION_KEY = 'brewjourney_user';
const JWT_STORAGE_KEY = 'brewjourney_jwt';
const LOGIN_DEMO_PASSWORD = 'demo';

/** Precios offline — alineados con BeverageExtras.js; claves como en HTML (español) o en decoradores (inglés). */
const LOCAL_EXTRA_PRICING = {
    shotPerUnit: 0.75,
    whippedCream: 0.50,
    sizeUpgrade: 1.0,
    milk(type) {
        const aliases = {
            almendra: 'almond',
            avena: 'oat',
            soya: 'soy',
            coco: 'coconut',
            almond: 'almond',
            oat: 'oat',
            soy: 'soy',
            coconut: 'coconut',
            regular: 'regular'
        };
        const k = aliases[String(type || '').toLowerCase()] || String(type || '').toLowerCase();
        const map = { regular: 0, almond: 0.6, oat: 0.7, soy: 0.5, coconut: 0.65 };
        return map[k] ?? 0;
    },
    flavor(name) {
        const aliases = {
            vainilla: 'vanilla',
            caramelo: 'caramel',
            avellana: 'hazelnut',
            canela: 'cinnamon',
            chocolate: 'mocha'
        };
        const k = aliases[String(name || '').toLowerCase()] || String(name || '').toLowerCase();
        const map = {
            vanilla: 0.5,
            caramel: 0.5,
            hazelnut: 0.55,
            mocha: 0.5,
            cinnamon: 0.45,
            pumpkinSpice: 0.65
        };
        return map[k] ?? 0.5;
    }
};

function getStoredToken() {
    try {
        return localStorage.getItem(JWT_STORAGE_KEY);
    } catch (e) {
        return null;
    }
}

function setStoredToken(token) {
    try {
        if (token) localStorage.setItem(JWT_STORAGE_KEY, token);
        else localStorage.removeItem(JWT_STORAGE_KEY);
    } catch (e) { /* ignore */ }
}

async function tryJson(res) {
    if (!res || !res.ok) return null;
    return res.json();
}

/**
 * Peticiones autenticadas: adjunta Bearer desde localStorage.
 * Si el servidor responde 401, limpia token + sesión y vuelve al login.
 */
async function apiFetch(path, options = {}) {
    const pathPart = String(path).replace(/^\//, '');
    const url = `${API_URL}/${pathPart}`;
    const token = getStoredToken();
    const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
        setStoredToken(null);
        localStorage.removeItem(SESSION_KEY);
        state.user = null;
        appListenersBound = false;
        showLoginScreen();
        showToast('Sesión expirada o no autorizada', 'error');
    }
    return res;
}

/** Hitos de recompensa (demostración académica) */
const REWARD_TIERS = [
    { stamps: 10, title: '10% descuento', icon: 'fa-percent', desc: 'Recompensa al acumular 10 sellos' },
    { stamps: 15, title: 'Café gratis', icon: 'fa-mug-hot', desc: 'Canje al llegar a 15 sellos' },
    { stamps: 25, title: 'Postre gratis', icon: 'fa-cookie-bite', desc: 'Canje al llegar a 25 sellos' }
];

const FALLBACK_USERS = [
    { id: 'u1', name: 'Samuel Orval', email: 'orval@brewjourney.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Samuel' },
    { id: 'u2', name: 'Karla Nava', email: 'karla@brewjourney.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karla' },
    { id: 'u3', name: 'Ximena García', email: 'ximena@brewjourney.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ximena' },
    { id: 'u4', name: 'Jesús Escobar', email: 'jesus@brewjourney.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jesus' }
];

// ===== Estado de la Aplicación =====
const state = {
    user: null,
    userStats: null,
    reviews: [],
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
    },
    products: [],
    stampRule: null,
    productFactoryTypes: [],
    apiBeverageOptions: null,
    apiInfo: null
};

let appListenersBound = false;

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
            userId: 'u1',
            cafe: { id: 'c1', name: 'Starbucks' },
            products: [
                { name: 'Cappuccino', price: 4.50 },
                { name: 'Croissant', price: 3.00 }
            ],
            total: 7.50,
            status: 'completed',
            orderType: 'dine-in',
            date: '2026-02-24'
        },
        {
            id: 'takeout_002',
            userId: 'u1',
            cafe: { id: 'c2', name: 'The Italian Coffee' },
            products: [
                { name: 'Latte', price: 4.00 },
                { name: 'Tiramisu', price: 6.00 }
            ],
            total: 10.00,
            status: 'completed',
            orderType: 'takeout',
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

// ===== Inicialización y sesión =====
document.addEventListener('DOMContentLoaded', () => {
    setupLoginAndLogout();
    void tryRestoreSession();
});

function setupLoginAndLogout() {
    const form = document.getElementById('loginForm');
    if (form) form.addEventListener('submit', handleLoginSubmit);
    const btn = document.getElementById('btnLogout');
    if (btn) btn.addEventListener('click', logout);
}

async function tryRestoreSession() {
    const token = getStoredToken();
    const raw = localStorage.getItem(SESSION_KEY);
    if (!token || !raw) {
        showLoginScreen();
        return;
    }
    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('unauthorized');
        const data = await res.json();
        state.user = {
            id: data.id,
            name: data.name,
            email: data.email,
            avatar: data.avatar
        };
        state.userStats = {
            totalStamps: data.totalStamps,
            totalOrders: data.totalOrders,
            totalReviews: data.totalReviews,
            cafesVisited: data.cafesVisited,
            totalSpent: data.totalSpent
        };
        showAppShell();
        await initApp();
    } catch (e) {
        console.warn('Sesión JWT no restaurada', e);
        setStoredToken(null);
        localStorage.removeItem(SESSION_KEY);
        showLoginScreen();
    }
}

function showLoginScreen() {
    const login = document.getElementById('loginScreen');
    const shell = document.getElementById('appShell');
    if (login) login.classList.remove('hidden');
    if (shell) shell.classList.add('hidden');
    populateLoginUserSelect();
}

function showAppShell() {
    const login = document.getElementById('loginScreen');
    const shell = document.getElementById('appShell');
    if (login) login.classList.add('hidden');
    if (shell) shell.classList.remove('hidden');
    updateNavUser();
}

async function populateLoginUserSelect() {
    const select = document.getElementById('loginUserSelect');
    if (!select) return;
    select.innerHTML = '';
    try {
        const res = await fetch(`${API_URL}/users`);
        if (res.ok) {
            const users = await res.json();
            users.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = u.name;
                opt.dataset.avatar = u.avatar || '';
                opt.dataset.email = u.email || '';
                select.appendChild(opt);
            });
            return;
        }
    } catch (e) {
        console.log('API usuarios no disponible, lista local');
    }
    FALLBACK_USERS.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = u.name;
        opt.dataset.avatar = u.avatar;
        opt.dataset.email = u.email;
        select.appendChild(opt);
    });
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const select = document.getElementById('loginUserSelect');
    const pwd = (document.getElementById('loginPassword')?.value || '').trim();
    if (pwd !== LOGIN_DEMO_PASSWORD) {
        showToast(`Contraseña incorrecta. Usa: ${LOGIN_DEMO_PASSWORD}`, 'error');
        return;
    }
    const userId = select.value;
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, password: pwd })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            showToast(data.error || 'No se pudo iniciar sesión', 'error');
            return;
        }
        setStoredToken(data.token);
        state.user = data.user;
        state.userStats = data.stats || null;
        localStorage.setItem(SESSION_KEY, JSON.stringify(state.user));
    } catch (err) {
        showToast('No se pudo contactar al servidor (¿npm start?)', 'error');
        return;
    }
    const pwdInput = document.getElementById('loginPassword');
    if (pwdInput) pwdInput.value = '';
    showAppShell();
    await initApp();
}

function logout() {
    setStoredToken(null);
    localStorage.removeItem(SESSION_KEY);
    appListenersBound = false;
    state.user = null;
    state.userStats = null;
    state.reviews = [];
    state.orders = [];
    state.stamps = [];
    state.cafes = [];
    showLoginScreen();
    const pwd = document.getElementById('loginPassword');
    if (pwd) pwd.value = '';
}

function updateNavUser() {
    if (!state.user) return;
    const nameEl = document.getElementById('navUserName');
    const imgEl = document.getElementById('navUserAvatar');
    if (nameEl) nameEl.textContent = state.user.name;
    if (imgEl) {
        imgEl.src = state.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(state.user.name)}`;
        imgEl.alt = state.user.name;
    }
}

async function initApp() {
    if (!state.user) return;
    try {
        await loadData();
    } catch (error) {
        if (!state.user) return;
        console.log('Backend no disponible, usando datos mock');
        useMockData();
    }
    renderAll();
    setupEventListeners();
    showSection('dashboard');
}

async function loadData() {
    if (!state.user) throw new Error('No user');

    const response = await apiFetch('cafes');
    if (!response.ok) throw new Error('Backend not available');

    state.cafes = await response.json();

    const ordersRes = await apiFetch(`orders?userId=${encodeURIComponent(state.user.id)}`);
    if (ordersRes.ok) {
        state.orders = await ordersRes.json();
    }

    const stampsRes = await apiFetch(`stamps/${state.user.id}`);
    if (stampsRes.ok) {
        state.stamps = await stampsRes.json();
    }

    const statsRes = await apiFetch(`stats/${state.user.id}`);
    if (statsRes.ok) {
        state.userStats = await statsRes.json();
    }

    const reviewsRes = await apiFetch(`reviews?userId=${encodeURIComponent(state.user.id)}`);
    if (reviewsRes.ok) {
        state.reviews = await reviewsRes.json();
    }

    await loadApiIntegrations();
}

async function loadApiIntegrations() {
    state.products = state.products || [];
    state.stampRule = state.stampRule || null;
    state.productFactoryTypes = state.productFactoryTypes || [];
    state.apiBeverageOptions = null;
    state.apiInfo = null;

    try {
        const data = await tryJson(await apiFetch('products'));
        if (data && Array.isArray(data)) state.products = data;
    } catch (e) { /* offline */ }

    try {
        const data = await tryJson(await apiFetch('stamps/rule/current'));
        if (data) state.stampRule = data;
    } catch (e) { /* offline */ }

    try {
        const data = await tryJson(await apiFetch('products/types'));
        if (data && data.types) state.productFactoryTypes = data.types;
    } catch (e) { /* offline */ }

    try {
        const data = await tryJson(await apiFetch('beverages/options'));
        if (data) state.apiBeverageOptions = data;
    } catch (e) { /* offline */ }

    try {
        const data = await tryJson(await apiFetch('info'));
        if (data) state.apiInfo = data;
    } catch (e) { /* offline */ }
}

async function refreshStatsAndStamps() {
    if (!state.user) return;
    try {
        const stampsRes = await apiFetch(`stamps/${state.user.id}`);
        if (stampsRes.ok) state.stamps = await stampsRes.json();
        const statsRes = await apiFetch(`stats/${state.user.id}`);
        if (statsRes.ok) state.userStats = await statsRes.json();
        const ordersRes = await apiFetch(`orders?userId=${encodeURIComponent(state.user.id)}`);
        if (ordersRes.ok) state.orders = await ordersRes.json();
        const ruleRes = await apiFetch('stamps/rule/current');
        if (ruleRes.ok) state.stampRule = await ruleRes.json();
    } catch (e) {
        /* sin API */
    }
}

async function reloadUserReviews() {
    if (!state.user) return;
    try {
        const reviewsRes = await apiFetch(`reviews?userId=${encodeURIComponent(state.user.id)}`);
        if (reviewsRes.ok) state.reviews = await reviewsRes.json();
        const statsRes = await apiFetch(`stats/${state.user.id}`);
        if (statsRes.ok) state.userStats = await statsRes.json();
    } catch (e) {
        /* sin API */
    }
}

function useMockData() {
    state.cafes = mockData.cafes.map(c => ({ ...c }));
    const uid = state.user.id;
    state.orders = mockData.orders.filter(o => o.userId === uid);
    state.stamps = mockData.cafes.flatMap(cafe =>
        Array(Math.min(cafe.stamps, 4)).fill().map((_, i) => ({
            userId: uid,
            cafeId: cafe.id,
            cafeName: cafe.name,
            date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        }))
    );
    state.reviews = [];
    state.userStats = {
        totalStamps: state.stamps.length,
        totalOrders: state.orders.length,
        totalReviews: 0,
        cafesVisited: new Set(state.stamps.map(s => s.cafeId)).size,
        totalSpent: state.orders.reduce((s, o) => s + o.total, 0)
    };
    state.products = mockData.products.map(p => ({ ...p }));
    state.stampRule = null;
    state.productFactoryTypes = ['beverage', 'dessert', 'snack', 'merchandise'];
    state.apiBeverageOptions = null;
    state.apiInfo = null;
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
    renderDashboard();
    renderRewardsUi();
    renderReviewsList();
    renderCustomizeApiHint();
}

function getStampCount() {
    return state.stamps ? state.stamps.length : 0;
}

function getNextRewardTier(current) {
    const sorted = [...REWARD_TIERS].sort((a, b) => a.stamps - b.stamps);
    for (const t of sorted) {
        if (current < t.stamps) return t;
    }
    return null;
}

function inferStampRuleSelectValue(info) {
    if (!info || !info.name) return 'basic';
    const n = String(info.name);
    if (n.includes('Doble') || n.toLowerCase().includes('doble')) return 'double';
    if (n.includes('Lealtad') || n.toLowerCase().includes('lealtad')) return 'loyalty';
    return 'basic';
}

function renderStampRulePanel() {
    const nameEl = document.getElementById('stampRuleCurrentName');
    if (!nameEl) return;
    const descEl = document.getElementById('stampRuleCurrentDesc');
    const historyEl = document.getElementById('stampRuleHistoryList');
    const select = document.getElementById('stampRuleSelect');
    const data = state.stampRule;

    if (!data || !data.currentRule) {
        nameEl.textContent = 'No disponible';
        if (descEl) descEl.textContent = 'Inicia el servidor Node y recarga la sesión para leer GET /api/stamps/rule/current.';
        if (historyEl) historyEl.innerHTML = '';
        if (select) select.value = 'basic';
        return;
    }

    nameEl.textContent = data.currentRule.name;
    if (descEl) descEl.textContent = data.currentRule.description || '';
    if (select) select.value = inferStampRuleSelectValue(data.currentRule);

    const hist = data.history || [];
    if (historyEl) {
        if (hist.length === 0) {
            historyEl.innerHTML = '<li class="stamp-rule-history-empty">Sin cambios de regla registrados en el contexto del servidor.</li>';
        } else {
            historyEl.innerHTML = [...hist].reverse().slice(0, 10).map((h) => {
                const d = h.changedAt ? new Date(h.changedAt).toLocaleString('es-MX') : '';
                const from = escapeHtml(String(h.from ?? ''));
                const to = escapeHtml(String(h.to ?? ''));
                return `<li><span class="h-from">${from}</span> → <span class="h-to">${to}</span> <time>${escapeHtml(d)}</time></li>`;
            }).join('');
        }
    }
}

function renderApiPatternSummary() {
    const el = document.getElementById('dashboardPatternSummary');
    const infoEl = document.getElementById('dashboardApiInfoLine');
    if (el) {
        const types = (state.productFactoryTypes || []).join(', ') || '—';
        el.innerHTML = `<strong>Factory Method</strong> — tipos en <code>ProductFactory</code> (<code>GET /api/products/types</code>): <code>${types}</code>. Cada ítem de la orden envía <code>type</code>, <code>name</code> y <code>price</code> (más campos opcionales) para <code>POST /api/orders</code>.`;
    }
    if (infoEl) {
        if (state.apiInfo && state.apiInfo.stats) {
            const s = state.apiInfo.stats;
            infoEl.textContent = `Resumen API (${state.apiInfo.name || 'BrewJourney'}): ${s.products ?? '—'} productos en catálogo · ${s.cafes ?? '—'} cafeterías · ${s.orders ?? '—'} órdenes.`;
        } else {
            infoEl.textContent = '';
        }
    }
}

function renderCustomizeApiHint() {
    const el = document.getElementById('apiBeverageOptionsHint');
    if (!el) return;
    const o = state.apiBeverageOptions;
    if (!o || !o.bases) {
        el.classList.add('hidden');
        el.innerHTML = '';
        return;
    }
    el.classList.remove('hidden');
    const bases = (o.bases || []).join(', ');
    const milks = o.milkTypes ? Object.keys(o.milkTypes).join(', ') : '';
    const flavors = o.flavors ? Object.keys(o.flavors).join(', ') : '';
    el.innerHTML = `<i class="fas fa-link"></i> Sincronizado con <code>GET /api/beverages/options</code>: bases <code>${escapeHtml(bases)}</code>${milks ? ` · leches <code>${escapeHtml(milks)}</code>` : ''}${flavors ? ` · jarabes <code>${escapeHtml(flavors)}</code>` : ''}. El precio final sigue viniendo de <code>POST /api/beverages/customize</code>.`;
}

async function applyStampRule() {
    const select = document.getElementById('stampRuleSelect');
    if (!select) return;
    const rule = select.value;
    try {
        const res = await apiFetch('stamps/rule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rule })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            showToast(data.error || 'No se pudo cambiar la regla', 'error');
            return;
        }
        state.stampRule = {
            currentRule: data.currentRule,
            history: data.history || []
        };
        renderStampRulePanel();
        showToast('Regla de sellos actualizada en el servidor', 'success');
    } catch (e) {
        showToast('Sin conexión al servidor', 'error');
    }
}

function renderDashboard() {
    const nameEl = document.getElementById('dashboardUserName');
    if (nameEl && state.user) nameEl.textContent = state.user.name;

    const s = state.userStats || {};
    const stamps = s.totalStamps != null ? s.totalStamps : getStampCount();
    const cafes = s.cafesVisited != null ? s.cafesVisited : new Set((state.stamps || []).map(x => x.cafeId)).size;
    const orders = s.totalOrders != null ? s.totalOrders : getOrdersForUser().length;
    const reviews = s.totalReviews != null ? s.totalReviews : (state.reviews || []).length;
    const spent = s.totalSpent != null ? s.totalSpent : getOrdersForUser().reduce((sum, o) => sum + (o.total || 0), 0);

    const map = {
        dashTotalStamps: stamps,
        dashCafesVisited: cafes,
        dashTotalOrders: orders,
        dashTotalReviews: reviews,
        dashTotalSpent: spent
    };
    Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = id === 'dashTotalSpent' ? `$${Number(val).toFixed(2)}` : String(val);
    });
    renderStampRulePanel();
    renderApiPatternSummary();
}

function renderRewardsUi() {
    const count = getStampCount();
    const next = getNextRewardTier(count);

    const hero = document.getElementById('rewardsHeroStamps');
    if (hero) hero.textContent = String(count);

    const prev = next ? REWARD_TIERS.filter(t => t.stamps < next.stamps).sort((a, b) => b.stamps - a.stamps)[0] : null;
    const lower = prev ? prev.stamps : 0;
    const upper = next ? next.stamps : (REWARD_TIERS[REWARD_TIERS.length - 1]?.stamps || 15);
    const nextLabel = document.getElementById('rewardsNextMeta');
    const nextDetail = document.getElementById('rewardsNextDetail');
    const bar = document.getElementById('rewardsProgressFill');
    const passportLabel = document.getElementById('nextRewardLabel');

    if (!next) {
        if (nextLabel) nextLabel.textContent = 'Todas las metas alcanzadas';
        if (nextDetail) nextDetail.textContent = '¡Sigue visitando cafeterías!';
        if (bar) bar.style.width = '100%';
        if (passportLabel) passportLabel.textContent = 'todas desbloqueadas';
    } else {
        if (nextLabel) nextLabel.textContent = `${next.title} (${next.stamps} sellos)`;
        if (nextDetail) nextDetail.textContent = `${next.stamps - count} sellos restantes · ${next.desc}`;
        const span = Math.max(upper - lower, 1);
        const pct = Math.min(100, ((count - lower) / span) * 100);
        if (bar) bar.style.width = `${pct}%`;
        if (passportLabel) passportLabel.textContent = `${next.title} (${next.stamps} sellos)`;
    }

    const compact = document.getElementById('rewardsCompactInPassport');
    if (compact) {
        compact.innerHTML = REWARD_TIERS.map(t => {
            const ok = count >= t.stamps;
            const diff = t.stamps - count;
            return `
                <div class="reward-card ${ok ? 'available' : ''}">
                    <div class="reward-icon"><i class="fas ${t.icon}"></i></div>
                    <div class="reward-info">
                        <h4>${t.title}</h4>
                        <p>${t.stamps} sellos</p>
                    </div>
                    <span class="reward-status ${ok ? '' : 'locked'}">${ok ? 'Desbloqueada' : `${diff} más`}</span>
                </div>`;
        }).join('');
    }

    const grid = document.getElementById('rewardsTierGrid');
    if (grid) {
        grid.innerHTML = REWARD_TIERS.map(t => {
            const unlocked = count >= t.stamps;
            const diff = t.stamps - count;
            return `
                <article class="reward-tier-card ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="reward-tier-head">
                        <div class="reward-tier-icon"><i class="fas ${t.icon}"></i></div>
                        <div>
                            <h4>${t.title}</h4>
                            <p class="reward-tier-meta">${t.desc}</p>
                        </div>
                    </div>
                    <p class="reward-tier-status ${unlocked ? 'done' : ''}">
                        ${unlocked ? 'Estado: canje disponible (demo)' : `Faltan ${diff} sello(s)`}
                    </p>
                </article>`;
        }).join('');
    }
}

function renderReviewsList() {
    const list = document.getElementById('reviewsList');
    const pill = document.getElementById('reviewsCountPill');
    if (pill) pill.textContent = String((state.reviews || []).length);

    if (!list) return;
    const items = state.reviews || [];
    if (items.length === 0) {
        list.innerHTML = `
            <div class="reviews-empty">
                <i class="fas fa-comment-slash" style="font-size:2rem;margin-bottom:0.75rem;opacity:0.5;"></i>
                <p>Aún no hay reseñas para este usuario.</p>
                <p style="margin-top:0.5rem;font-size:0.9rem;">Publica una desde <strong>Cafeterías</strong>.</p>
            </div>`;
        return;
    }
    list.innerHTML = items.map(r => {
        const stars = `${'<i class="fas fa-star"></i>'.repeat(r.rating)}${'<i class="far fa-star"></i>'.repeat(5 - r.rating)}`;
        const tags = (r.tags || []).map(t => `<span class="review-tag-pill">${escapeHtml(t)}</span>`).join('');
        return `
            <article class="review-list-card">
                <div class="review-list-card-header">
                    <span class="review-list-cafe">${escapeHtml(r.cafeName || 'Cafetería')}</span>
                    <span class="review-list-date">${formatDate(r.createdAt || r.updatedAt)}</span>
                </div>
                <div class="review-list-stars">${stars}</div>
                <p class="review-list-text">${escapeHtml(r.text || '')}</p>
                ${tags ? `<div class="review-list-tags">${tags}</div>` : ''}
                ${state.user && r.userId === state.user.id ? `
                <div class="review-list-actions">
                    <button type="button" class="btn-review-action" data-review-action="edit" data-review-id="${r.id}"><i class="fas fa-pen"></i> Editar</button>
                    <button type="button" class="btn-review-action btn-review-action-secondary" data-review-action="history" data-review-id="${r.id}"><i class="fas fa-clock-rotate-left"></i> Historial</button>
                    <button type="button" class="btn-review-action btn-review-action-secondary" data-review-action="undo" data-review-id="${r.id}"><i class="fas fa-rotate-left"></i> Deshacer (servidor)</button>
                </div>` : ''}
            </article>`;
    }).join('');
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function onReviewsListClick(e) {
    const btn = e.target.closest('[data-review-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-review-id');
    const action = btn.getAttribute('data-review-action');
    if (!id) return;
    if (action === 'edit') openEditReviewModalById(id);
    else if (action === 'history') openReviewHistoryModal(id);
    else if (action === 'undo') undoServerReview(id);
}

function openEditReviewModalById(reviewId) {
    const r = (state.reviews || []).find((x) => x.id === reviewId);
    if (!r || !state.user || r.userId !== state.user.id) {
        showToast('No se puede editar esta reseña', 'error');
        return;
    }
    state.currentReview.history = [];
    state.currentReview.historyIndex = -1;
    document.getElementById('reviewText').value = '';
    document.querySelectorAll('#starRating i').forEach((star) => star.classList.remove('active'));
    document.querySelectorAll('.tags-container .tag').forEach((tag) => tag.classList.remove('selected'));

    document.getElementById('reviewEditId').value = r.id;
    document.getElementById('reviewCafeId').value = r.cafeId;
    const title = document.getElementById('reviewModalTitle');
    if (title) title.innerHTML = '<i class="fas fa-pen"></i> Editar reseña — <code>PUT /api/reviews/:id</code>';
    const sub = document.getElementById('reviewSubmitBtn');
    if (sub) sub.innerHTML = '<i class="fas fa-save"></i> Guardar (Memento: snapshot antes de editar)';
    setRating(r.rating);
    document.getElementById('reviewText').value = r.text || '';
    document.querySelectorAll('.tags-container .tag').forEach((tag) => {
        tag.classList.toggle('selected', (r.tags || []).includes(tag.dataset.tag));
    });
    state.currentReview.tags = [...(r.tags || [])];
    state.currentReview.history = [];
    state.currentReview.historyIndex = -1;
    document.getElementById('reviewModal').classList.remove('hidden');
    updateUndoRedoButtons();
}

function closeReviewHistoryModal() {
    document.getElementById('reviewHistoryModal')?.classList.add('hidden');
}

async function openReviewHistoryModal(reviewId) {
    const modal = document.getElementById('reviewHistoryModal');
    const body = document.getElementById('reviewHistoryBody');
    if (!modal || !body) return;
    modal.classList.remove('hidden');
    body.innerHTML = '<p class="muted">Cargando historial…</p>';
    try {
        const res = await apiFetch(`reviews/${encodeURIComponent(reviewId)}/history`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error();
        const items = data.history || [];
        if (items.length === 0) {
            body.innerHTML = '<p>Sin entradas en el historial.</p>';
            return;
        }
        body.innerHTML = `<ol class="review-history-ol">${items.map((h) => `
            <li>
                <time>${escapeHtml(formatDate(h.savedAt))}</time>
                — ${escapeHtml(h.reason || '')}
                — rating <strong>${escapeHtml(String(h.rating ?? ''))}</strong>
                <div class="review-history-preview">${escapeHtml((h.textPreview || '').replace(/\.\.\.$/, ''))}</div>
            </li>`).join('')}</ol>`;
    } catch (e) {
        body.innerHTML = '<p>No se pudo cargar el historial (¿servidor activo?).</p>';
    }
}

async function undoServerReview(reviewId) {
    try {
        const res = await apiFetch(`reviews/${encodeURIComponent(reviewId)}/undo`, { method: 'POST' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
            showToast(data.message || 'No hay cambios para deshacer', 'error');
            return;
        }
        showToast(data.message || 'Estado restaurado desde Memento (servidor)', 'success');
        await reloadUserReviews();
        renderReviewsList();
        renderDashboard();
        updateStats();
    } catch (e) {
        showToast('Sin conexión al servidor', 'error');
    }
}

function renderPassportPreview() {
    const container = document.getElementById('passportPreview');
    if (!container) return;
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
    if (!container) return;

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

function getOrdersForUser() {
    if (!state.user) return [];
    return (state.orders || []).filter(o => !o.userId || o.userId === state.user.id);
}

function renderOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;

    const userOrders = getOrdersForUser();
    const totalSum = userOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const badgeCount = document.getElementById('ordersCountBadge');
    const badgeSum = document.getElementById('ordersSumBadge');
    if (badgeCount) badgeCount.textContent = String(userOrders.length);
    if (badgeSum) badgeSum.textContent = `$${totalSum.toFixed(2)}`;

    if (userOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No tienes órdenes aún</p>
            </div>
        `;
        return;
    }

    const typeLabel = (t) => (t === 'takeout' ? 'Para llevar' : t === 'dine-in' ? 'En local' : (t || 'orden'));

    container.innerHTML = userOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">#${String(order.id).slice(-8).toUpperCase()}</span>
                <span>
                    <span class="order-status ${order.status}">${order.status === 'completed' ? 'Completada' : 'Pendiente'}</span>
                    <span class="order-type-chip">${typeLabel(order.orderType)}</span>
                </span>
            </div>
            <div class="order-cafe">
                <i class="fas fa-store"></i>
                ${order.cafe?.name || 'Cafetería'}
            </div>
            <div class="order-products">
                ${(order.products || []).map(p => `
                    <div class="order-product">
                        <span>${p.name}</span>
                        <span>$${Number(p.price).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <span class="order-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(order.date || order.createdAt)}
                </span>
                <span class="order-total-amount">$${Number(order.total).toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

function iconClassForProduct(product) {
    if (product.icon) {
        const ic = String(product.icon);
        return ic.startsWith('fa-') ? ic : `fa-${ic}`;
    }
    const m = {
        beverage: 'fa-mug-hot',
        snack: 'fa-cookie-bite',
        dessert: 'fa-cake-candles',
        merchandise: 'fa-mug-saucer'
    };
    return m[product.type] || 'fa-tag';
}

function renderProductSelector() {
    const container = document.getElementById('productsSelector');
    if (!container) return;

    const list = (state.products && state.products.length > 0) ? state.products : mockData.products;

    container.innerHTML = list.map((product) => {
        const ic = iconClassForProduct(product);
        const size = product.size || 'medium';
        const typeCategory = product.typeCategory || '';
        const flavor = product.flavor || '';
        const category = product.category || '';
        return `
        <div class="product-option"
             data-id="${product.id}"
             data-type="${product.type}"
             data-name="${String(product.name).replace(/"/g, '&quot;')}"
             data-price="${product.price}"
             data-size="${size}"
             data-type-category="${String(typeCategory).replace(/"/g, '&quot;')}"
             data-flavor="${String(flavor).replace(/"/g, '&quot;')}"
             data-category="${String(category).replace(/"/g, '&quot;')}">
            <i class="fas ${ic}"></i>
            <div class="name">${escapeHtml(product.name)}</div>
            <div class="price">$${Number(product.price).toFixed(2)}</div>
            <span class="product-type-tag">${escapeHtml(product.type)}</span>
        </div>`;
    }).join('');
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
    const ts = document.getElementById('totalStamps');
    const tc = document.getElementById('totalCafes');
    const tr = document.getElementById('totalReviews');
    if (!ts || !tc || !tr) return;
    ts.textContent = getStampCount();
    tc.textContent = new Set(state.stamps.map(s => s.cafeId)).size;
    const rev = state.userStats?.totalReviews != null
        ? state.userStats.totalReviews
        : (state.reviews || []).length;
    tr.textContent = rev;
}

function updateProgress() {
    const fill = document.getElementById('progressFill');
    const curEl = document.getElementById('currentStamps');
    if (!fill || !curEl) return;
    const current = getStampCount();
    curEl.textContent = current;
    const next = getNextRewardTier(current);
    if (!next) {
        fill.style.width = '100%';
        return;
    }
    const prevTier = [...REWARD_TIERS].filter(t => t.stamps < next.stamps).sort((a, b) => b.stamps - a.stamps)[0];
    const lower = prevTier ? prevTier.stamps : 0;
    const span = Math.max(next.stamps - lower, 1);
    const pct = Math.min(100, ((current - lower) / span) * 100);
    fill.style.width = `${pct}%`;
}

// ===== Event Listeners =====
function setupEventListeners() {
    if (appListenersBound) return;
    appListenersBound = true;

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const a = e.target.closest('a');
            if (!a || !a.getAttribute('href')) return;
            const href = a.getAttribute('href');
            const section = href.startsWith('#') ? href.slice(1) : href;
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

    document.getElementById('stampRuleApplyBtn')?.addEventListener('click', applyStampRule);

    document.getElementById('reviewsList')?.addEventListener('click', onReviewsListClick);
}

// ===== Navegación =====
function showSection(sectionId) {
    document.querySelectorAll('.section, .hero').forEach(section => {
        section.classList.add('hidden');
    });

    if (sectionId === 'home') {
        const hero = document.querySelector('.hero');
        if (hero) hero.classList.remove('hidden');
    } else {
        const el = document.getElementById(sectionId);
        if (el) el.classList.remove('hidden');
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
    });

    if (sectionId === 'customize') {
        renderCustomizeApiHint();
    }
}

// ===== Acciones =====
async function registerVisit(cafeId) {
    if (!state.user) return;
    const cafe = state.cafes.find(c => c.id === cafeId);
    if (!cafe) return;

    try {
        const orderInput = document.getElementById('visitOrderTotal');
        const rawTotal = orderInput ? parseFloat(orderInput.value) : 0;
        const orderTotal = Number.isFinite(rawTotal) ? rawTotal : 0;

        const response = await apiFetch('stamps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: state.user.id,
                cafeId: cafeId,
                orderTotal
            })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success === false) {
                showToast(result.message || 'No se pudo registrar la visita', 'error');
            } else {
                showToast(result.message || '¡Visita registrada!', 'success');
            }
        } else {
            showToast('No se pudo contactar al servidor', 'error');
        }
    } catch (error) {
        const newStamp = {
            cafeId: cafeId,
            cafeName: cafe.name,
            date: new Date().toISOString().split('T')[0]
        };

        state.stamps.push(newStamp);
        cafe.stamps = (cafe.stamps || 0) + 1;

        showToast(`¡Sello agregado en ${cafe.name}! (modo sin servidor)`, 'success');
    }

    await refreshStatsAndStamps();
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

    if (!state.user) return;

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
    const products = Array.from(selected).map((option) => {
        const item = {
            type: option.dataset.type,
            name: option.dataset.name,
            price: parseFloat(option.dataset.price)
        };
        if (option.dataset.size) item.size = option.dataset.size;
        if (option.dataset.typeCategory) item.typeCategory = option.dataset.typeCategory;
        if (option.dataset.flavor) item.flavor = option.dataset.flavor;
        if (option.dataset.category) item.category = option.dataset.category;
        return item;
    });

    const total = products.reduce((sum, p) => sum + p.price, 0);
    const orderTypeEl = document.getElementById('orderTypeSelect');
    const orderType = orderTypeEl ? orderTypeEl.value : 'dine-in';

    try {
        const response = await apiFetch('orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: state.user.id,
                cafeId: cafeId,
                items: products,
                type: orderType
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showToast(result.message || '¡Orden creada exitosamente!', 'success');
            await refreshStatsAndStamps();
        }
    } catch (error) {
        state.orders.unshift({
            id: `order_${Date.now()}`,
            userId: state.user.id,
            cafe: { id: cafeId, name: cafe.name },
            products: products,
            total: total,
            status: 'completed',
            orderType: 'dine-in',
            createdAt: new Date().toISOString()
        });

        showToast('¡Orden creada (modo offline)!', 'success');
    }

    selected.forEach(option => option.classList.remove('selected'));
    document.getElementById('orderCafe').value = '';
    updateOrderSummary();

    renderAll();
}

// ===== Modal de Reseñas =====
function openReviewModal(cafeId) {
    if (!state.user) {
        showToast('Inicia sesión para escribir una reseña', 'error');
        return;
    }
    document.getElementById('reviewCafeId').value = cafeId;
    resetReviewState();
    document.getElementById('reviewModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('reviewModal').classList.add('hidden');
    resetReviewState();
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
    const edit = document.getElementById('reviewEditId');
    if (edit) edit.value = '';
    const title = document.getElementById('reviewModalTitle');
    if (title) title.innerHTML = '<i class="fas fa-star"></i> Nueva reseña — <code>POST /api/reviews</code>';
    const sub = document.getElementById('reviewSubmitBtn');
    if (sub) sub.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar reseña';

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

    if (!state.user) return;

    const editId = document.getElementById('reviewEditId')?.value?.trim();
    const cafeId = document.getElementById('reviewCafeId').value;
    const cafe = state.cafes.find(c => c.id === cafeId);

    if (!cafe) {
        showToast('Cafetería no válida', 'error');
        return;
    }

    if (state.currentReview.rating === 0) {
        showToast('Selecciona una calificación', 'error');
        return;
    }

    const text = document.getElementById('reviewText').value;
    const rating = state.currentReview.rating;
    const tags = state.currentReview.tags;

    const bodyCreate = {
        cafeId: cafeId,
        userId: state.user.id,
        rating,
        text,
        tags
    };

    const bodyPut = { text, rating, tags };

    let ok = false;
    try {
        let res;
        if (editId) {
            res = await apiFetch(`reviews/${encodeURIComponent(editId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPut)
            });
        } else {
            res = await apiFetch('reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyCreate)
            });
        }
        ok = res.ok;
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showToast(err.error || 'No se pudo guardar la reseña', 'error');
        }
    } catch (error) {
        showToast('Sin conexión al servidor', 'error');
    }

    if (ok) {
        showToast(editId ? 'Reseña actualizada (Memento en servidor)' : `¡Reseña publicada para ${cafe.name}!`, 'success');
        closeModal();
        await reloadUserReviews();
        renderReviewsList();
        renderDashboard();
        updateStats();
    }
}

// ===== Utilidades =====
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const s = String(dateStr).trim();
    let date;
    // Solo fecha YYYY-MM-DD: interpretar como calendario local (evita desfase de un día vs UTC).
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, mo, d] = s.split('-').map(Number);
        date = new Date(y, mo - 1, d);
    } else {
        date = new Date(dateStr);
    }
    if (Number.isNaN(date.getTime())) return '—';
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
        const response = await apiFetch('beverages/customize', {
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
                extraPrice = LOCAL_EXTRA_PRICING.milk(extra.milkType);
                extraName = `Leche de ${capitalize(extra.milkType)}`;
                decoratorStr = `MilkDecorator("${extra.milkType}")`;
                descriptions.push(`leche de ${extra.milkType}`);
                break;
            case 'extraShot':
                extraPrice = LOCAL_EXTRA_PRICING.shotPerUnit * extra.shots;
                extraName = extra.shots > 1 ? `${extra.shots} Shots Extra` : 'Shot Extra';
                decoratorStr = `ExtraShotDecorator(${extra.shots})`;
                descriptions.push(`${extra.shots} shot${extra.shots > 1 ? 's' : ''} extra`);
                break;
            case 'whippedCream':
                extraPrice = LOCAL_EXTRA_PRICING.whippedCream;
                extraName = 'Crema Batida';
                decoratorStr = 'WhippedCreamDecorator()';
                descriptions.push('crema batida');
                break;
            case 'flavorSyrup':
                extraPrice = LOCAL_EXTRA_PRICING.flavor(extra.flavor);
                extraName = `Jarabe ${capitalize(extra.flavor)}`;
                decoratorStr = `FlavorSyrupDecorator("${extra.flavor}")`;
                descriptions.push(`jarabe de ${extra.flavor}`);
                break;
            case 'sizeUpgrade':
                extraPrice = LOCAL_EXTRA_PRICING.sizeUpgrade;
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
    if (!state.user) {
        showToast('Inicia sesión para agregar a la orden', 'error');
        return;
    }
    const { baseName, basePrice, size, extras } = state.customBeverage;
    
    // Get the final product info
    let finalName = baseName;
    let finalPrice = basePrice;
    
    // Calculate total with extras
    extras.forEach(extra => {
        switch (extra.type) {
            case 'milk': finalPrice += LOCAL_EXTRA_PRICING.milk(extra.milkType); break;
            case 'extraShot': finalPrice += LOCAL_EXTRA_PRICING.shotPerUnit * extra.shots; break;
            case 'whippedCream': finalPrice += LOCAL_EXTRA_PRICING.whippedCream; break;
            case 'flavorSyrup': finalPrice += LOCAL_EXTRA_PRICING.flavor(extra.flavor); break;
            case 'sizeUpgrade': finalPrice += LOCAL_EXTRA_PRICING.sizeUpgrade; break;
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
        const response = await apiFetch('orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: state.user.id,
                cafeId: cafeId,
                items: [{
                    type: 'beverage',
                    name: orderItem.name,
                    price: finalPrice,
                    size: state.customBeverage.size || 'medium'
                }],
                type: 'dine-in'
            })
        });
        
        if (response.ok) {
            showToast(`¡Bebida personalizada agregada! ${extras.length} decorador(es)`, 'success');
            await refreshStatsAndStamps();
        } else {
            showToast('No se pudo registrar la orden', 'error');
        }
    } catch (error) {
        state.orders.unshift({
            id: `custom_${Date.now()}`,
            userId: state.user.id,
            cafe: { id: cafeId, name: cafe.name },
            products: [orderItem],
            total: finalPrice,
            status: 'completed',
            orderType: 'dine-in',
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
window.closeReviewHistoryModal = closeReviewHistoryModal;
