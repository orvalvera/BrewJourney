/**
 * BrewJourney - Backend Server
 * Express API with lowdb persistence
 */

import express from 'express';
import cors from 'cors';
import database from './database.js';

// Importar patrones - Factory (Creacional)
import { ProductFactory } from './BrewJourney/patterns/factory/ProductFactory.js';

// Importar patrones - Decorator (Estructural)
import { BaseBeverage, Latte, Cappuccino, Mocha, Espresso, Americano } from './BrewJourney/patterns/decorator/BaseBeverage.js';
import { 
    MilkDecorator, 
    ExtraShotDecorator, 
    WhippedCreamDecorator, 
    FlavorSyrupDecorator,
    SizeUpgradeDecorator 
} from './BrewJourney/patterns/decorator/BeverageExtras.js';

// Importar patrones - Strategy (Comportamiento)
import { StampRuleContext } from './BrewJourney/patterns/strategy/StampRuleContext.js';
import { BasicStampRule } from './BrewJourney/patterns/strategy/BasicStampRule.js';
import { DoubleStampRule } from './BrewJourney/patterns/strategy/DoubleStampRule.js';
import { LoyaltyBonusRule } from './BrewJourney/patterns/strategy/LoyaltyBonusRule.js';

import { signUserToken, authenticateToken, validateDemoLogin } from './middleware/auth.js';

function getSizeName(size) {
    const names = { small: 'Chico', medium: 'Mediano', large: 'Grande' };
    return names[size] || 'Mediano';
}

const MILK_TYPE_ALIASES = {
    almendra: 'almond',
    avena: 'oat',
    soya: 'soy',
    coco: 'coconut',
    coconut: 'coconut',
    almond: 'almond',
    oat: 'oat',
    soy: 'soy',
    regular: 'regular'
};

function normalizeMilkTypeKey(raw) {
    if (!raw || raw === 'regular') return 'regular';
    const k = String(raw).toLowerCase();
    const key = MILK_TYPE_ALIASES[k] || (MilkDecorator.MILK_TYPES[k] ? k : null) || 'regular';
    return MilkDecorator.MILK_TYPES[key] ? key : 'regular';
}

/** Jarabes en `index.html` (vainilla, caramelo, …) vs claves en FlavorSyrupDecorator. */
const FLAVOR_ALIASES = {
    vainilla: 'vanilla',
    caramelo: 'caramel',
    avellana: 'hazelnut',
    canela: 'cinnamon',
    chocolate: 'mocha'
};

function normalizeFlavorKey(raw) {
    if (!raw) return 'vanilla';
    const k = String(raw).toLowerCase();
    const key = FLAVOR_ALIASES[k] || (FlavorSyrupDecorator.FLAVORS[k] ? k : null) || 'vanilla';
    return FlavorSyrupDecorator.FLAVORS[key] ? key : 'vanilla';
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/** Rutas públicas de la API: login JWT y listado de usuarios (demo). El resto exige Bearer token. */
function apiAuthGate(req, res, next) {
    if (!req.path.startsWith('/api')) return next();
    if (req.method === 'POST' && req.path === '/api/auth/login') return next();
    if (req.method === 'GET' && req.path === '/api/users') return next();
    return authenticateToken(req, res, next);
}

app.use(apiAuthGate);

function requireCurrentUser(req, res, requestedUserId) {
    if (!requestedUserId) {
        res.status(400).json({ error: 'Usuario requerido' });
        return false;
    }
    if (requestedUserId !== req.user?.sub) {
        res.status(403).json({ error: 'Acceso denegado para este usuario' });
        return false;
    }
    return true;
}

// Contexto de estrategia de sellos (singleton)
const stampRuleContext = new StampRuleContext(new BasicStampRule());

// ===== RUTAS API =====

// --- Autenticación JWT (demo) ---
app.post('/api/auth/login', (req, res) => {
    const { userId, password } = req.body || {};
    if (!userId || !validateDemoLogin(password)) {
        return res.status(401).json({ error: 'Credenciales inválidas (demo: password "demo")' });
    }
    const user = database.getUserById(userId);
    if (!user) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const token = signUserToken(user);
    const stats = database.getUserStats(user.id);
    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        },
        stats: {
            totalStamps: stats.totalStamps,
            totalOrders: stats.totalOrders,
            totalReviews: stats.totalReviews,
            cafesVisited: stats.cafesVisited,
            totalSpent: stats.totalSpent
        }
    });
});

app.get('/api/auth/me', (req, res) => {
    const user = database.getUserById(req.user.sub);
    if (!user) {
        return res.status(401).json({ error: 'Usuario del token no existe' });
    }
    const stats = database.getUserStats(user.id);
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        ...stats
    });
});

// --- Cafeterías ---
app.get('/api/cafes', (req, res) => {
    const cafes = database.getCafes();
    const stamps = database.getStamps();
    const reviews = database.getReviews();
    
    const cafesWithStats = cafes.map(cafe => ({
        ...cafe,
        stamps: stamps.filter(s => s.cafeId === cafe.id).length,
        reviews: reviews.filter(r => r.cafeId === cafe.id).length
    }));
    
    res.json(cafesWithStats);
});

app.get('/api/cafes/:id', (req, res) => {
    const cafe = database.getCafeById(req.params.id);
    if (!cafe) {
        return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    
    const reviews = database.getReviewsByCafe(req.params.id);
    const stamps = database.getStampsByCafe(req.params.id);
    
    res.json({
        ...cafe,
        reviews,
        totalStamps: stamps.length
    });
});

// --- Usuarios ---
app.get('/api/users', (req, res) => {
    const users = database.getUsers();
    res.json(users);
});

app.get('/api/users/:id', (req, res) => {
    if (!requireCurrentUser(req, res, req.params.id)) return;

    const user = database.getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const stats = database.getUserStats(req.params.id);
    res.json({ ...user, ...stats });
});

// --- Productos ---
app.get('/api/products', (req, res) => {
    const { type } = req.query;
    const products = type 
        ? database.getProductsByType(type)
        : database.getProducts();
    res.json(products);
});

// --- Bebidas Personalizadas (Decorator Pattern) ---
const beverageClasses = {
    latte: Latte,
    cappuccino: Cappuccino,
    mocha: Mocha,
    espresso: Espresso,
    americano: Americano
};

app.get('/api/beverages/options', (req, res) => {
    res.json({
        bases: Object.keys(beverageClasses),
        sizes: ['small', 'medium', 'large'],
        milkTypes: Object.keys(MilkDecorator.MILK_TYPES),
        flavors: Object.keys(FlavorSyrupDecorator.FLAVORS),
        extras: ['extraShot', 'whippedCream']
    });
});

app.post('/api/beverages/customize', (req, res) => {
    const { base, baseName, basePrice, size, milk, flavor, extraShots, whippedCream, extras = [] } = req.body;
    
    // Si viene del frontend con extras array, usar el formato simple con BaseBeverage
    if (extras.length > 0 || baseName) {
        const beverageBase = baseName || base || 'Café';
        const price = basePrice || 3.00;
        
        let beverage = new BaseBeverage(beverageBase, price, size || 'medium');
        const breakdown = [{ item: `${beverageBase} (${getSizeName(size)})`, price: price }];
        const decoratorChain = [`BaseBeverage("${beverageBase}", $${price.toFixed(2)})`];
        const descriptions = [];
        
        // Procesar extras array
        extras.forEach(extra => {
            switch (extra.type) {
                case 'milk': {
                    const milkKey = normalizeMilkTypeKey(extra.milkType);
                    beverage = new MilkDecorator(beverage, milkKey);
                    const milkMeta = MilkDecorator.MILK_TYPES[milkKey];
                    const milkLabel = milkMeta.price === 0 ? 'Leche regular' : milkMeta.name;
                    breakdown.push({ item: milkLabel, price: milkMeta.price });
                    decoratorChain.push(`MilkDecorator("${milkKey}")`);
                    descriptions.push(milkMeta.price === 0 ? 'leche regular' : milkMeta.name.toLowerCase());
                    break;
                }
                case 'extraShot': {
                    const shots = extra.shots || 1;
                    beverage = new ExtraShotDecorator(beverage, shots);
                    const shotPrice = ExtraShotDecorator.PRICE_PER_SHOT * shots;
                    breakdown.push({ item: `${shots} Shot(s) Extra`, price: shotPrice });
                    decoratorChain.push(`ExtraShotDecorator(${shots})`);
                    descriptions.push(`${shots} shot${shots > 1 ? 's' : ''} extra`);
                    break;
                }
                case 'whippedCream':
                    beverage = new WhippedCreamDecorator(beverage);
                    breakdown.push({ item: 'Crema Batida', price: WhippedCreamDecorator.PRICE });
                    decoratorChain.push('WhippedCreamDecorator()');
                    descriptions.push('crema batida');
                    break;
                case 'flavorSyrup': {
                    const flavorKey = normalizeFlavorKey(extra.flavor);
                    const flav = FlavorSyrupDecorator.FLAVORS[flavorKey];
                    beverage = new FlavorSyrupDecorator(beverage, flavorKey);
                    breakdown.push({ item: `Jarabe ${flav.name}`, price: flav.price });
                    decoratorChain.push(`FlavorSyrupDecorator("${flavorKey}")`);
                    descriptions.push(`jarabe ${flav.name.toLowerCase()}`);
                    break;
                }
                case 'sizeUpgrade':
                    beverage = new SizeUpgradeDecorator(beverage);
                    breakdown.push({ item: 'Tamaño Extra', price: 1.00 });
                    decoratorChain.push('SizeUpgradeDecorator()');
                    descriptions.push('tamaño extra');
                    break;
            }
        });
        
        const description = descriptions.length > 0 
            ? `${beverageBase} con ${descriptions.join(', ')}`
            : `${beverageBase} sin extras adicionales`;
        
        return res.json({
            name: beverage.getName(),
            price: beverage.getPrice(),
            description: description,
            breakdown: breakdown,
            decoratorChain: decoratorChain,
            pattern: 'Decorator Pattern - Cada extra envuelve la bebida agregando funcionalidad'
        });
    }
    
    // Formato legacy con clases específicas
    const BeverageClass = beverageClasses[base?.toLowerCase()];
    if (!BeverageClass) {
        return res.status(400).json({ error: 'Bebida base no válida' });
    }
    
    let beverage = new BeverageClass(size || 'medium');
    const appliedDecorators = [];
    
    // Aplicar decoradores según las opciones
    if (milk && milk !== 'regular') {
        const milkKey = normalizeMilkTypeKey(milk);
        beverage = new MilkDecorator(beverage, milkKey);
        appliedDecorators.push(`Leche: ${milkKey}`);
    }
    
    if (extraShots && extraShots > 0) {
        beverage = new ExtraShotDecorator(beverage, extraShots);
        appliedDecorators.push(`${extraShots} shot(s) extra`);
    }
    
    if (flavor) {
        const flavorKey = normalizeFlavorKey(flavor);
        beverage = new FlavorSyrupDecorator(beverage, flavorKey);
        appliedDecorators.push(`Sabor: ${flavorKey}`);
    }
    
    if (whippedCream) {
        beverage = new WhippedCreamDecorator(beverage);
        appliedDecorators.push('Crema batida');
    }
    
    res.json({
        success: true,
        beverage: {
            name: beverage.getName(),
            price: beverage.getPrice(),
            size: beverage.getSize(),
            description: beverage.getDescription(),
            ingredients: beverage.getIngredients()
        },
        decoratorsApplied: appliedDecorators,
        pattern: 'Decorator Pattern - Cada extra es un decorador que envuelve la bebida base'
    });
});

app.get('/api/products/types', (req, res) => {
    res.json({
        types: ProductFactory.getRegisteredTypes()
    });
});

// --- Sellos (Strategy Pattern) ---
app.get('/api/stamps/:userId', (req, res) => {
    if (!requireCurrentUser(req, res, req.params.userId)) return;

    const stamps = database.getStampsByUser(req.params.userId);
    const cafes = database.getCafes();
    
    const stampsWithCafe = stamps.map(stamp => {
        const cafe = cafes.find(c => c.id === stamp.cafeId);
        return {
            ...stamp,
            cafeName: cafe?.name || 'Desconocido',
            cafeImage: cafe?.image
        };
    });
    
    res.json(stampsWithCafe);
});

app.post('/api/stamps', async (req, res) => {
    const { userId, cafeId, orderTotal } = req.body;
    if (!requireCurrentUser(req, res, userId)) return;
    
    const user = database.getUserById(userId);
    const cafe = database.getCafeById(cafeId);
    
    if (!user || !cafe) {
        return res.status(400).json({ error: 'Usuario o cafetería no válidos' });
    }
    
    // Verificar si ya tiene sello hoy
    const hasStamp = database.hasStampToday(userId, cafeId);
    if (hasStamp) {
        return res.json({
            success: false,
            message: 'Ya tienes un sello de hoy en esta cafetería'
        });
    }
    
    // Aplicar la regla de sellos actual (Strategy)
    const currentRule = stampRuleContext.getRuleInfo();
    let stampType = 'regular';
    let bonusStamps = 0;
    
    // Lógica de bonus según regla
    if (currentRule.name === 'DoubleStampRule' && orderTotal >= 10) {
        bonusStamps = 1;
        stampType = 'double';
    }
    
    // Crear sello principal
    const stamp = await database.addStamp({
        userId,
        cafeId,
        type: stampType,
        orderTotal
    });
    
    // Crear sello bonus si aplica
    if (bonusStamps > 0) {
        await database.addStamp({
            userId,
            cafeId,
            type: 'bonus',
            orderTotal
        });
    }
    
    const totalStamps = database.getStampsByUserAndCafe(userId, cafeId).length;
    
    res.json({
        success: true,
        stamp,
        bonusStamps,
        totalStamps,
        rule: currentRule
    });
});

// Cambiar regla de sellos
app.post('/api/stamps/rule', async (req, res) => {
    const { rule } = req.body;
    
    switch (rule) {
        case 'basic':
            stampRuleContext.setRule(new BasicStampRule());
            break;
        case 'double':
            stampRuleContext.setRule(new DoubleStampRule(10.00));
            break;
        case 'loyalty':
            stampRuleContext.setRule(new LoyaltyBonusRule(5));
            break;
        default:
            return res.status(400).json({ error: 'Regla no válida' });
    }
    
    // Guardar en settings
    await database.updateSettings({
        currentStampRule: rule,
        stampRuleHistory: [
            ...database.getSettings().stampRuleHistory,
            { rule, changedAt: new Date().toISOString() }
        ]
    });
    
    res.json({
        success: true,
        currentRule: stampRuleContext.getRuleInfo(),
        history: stampRuleContext.getRuleHistory()
    });
});

app.get('/api/stamps/rule/current', (req, res) => {
    res.json({
        currentRule: stampRuleContext.getRuleInfo(),
        history: stampRuleContext.getRuleHistory()
    });
});

// --- Órdenes (Factory Pattern) ---
app.get('/api/orders', (req, res) => {
    const { userId } = req.query;
    const requestedUserId = userId || req.user.sub;
    if (!requireCurrentUser(req, res, requestedUserId)) return;
    
    let orders = database.getOrdersByUser(requestedUserId);
    
    const cafes = database.getCafes();
    
    const ordersWithCafe = orders.map(order => {
        const cafe = cafes.find(c => c.id === order.cafeId);
        return {
            ...order,
            cafe: cafe ? { id: cafe.id, name: cafe.name, image: cafe.image } : null
        };
    });
    
    res.json(ordersWithCafe);
});

app.post('/api/orders', async (req, res) => {
    const { userId, cafeId, items, type = 'dine-in' } = req.body;
    if (!requireCurrentUser(req, res, userId)) return;
    
    const user = database.getUserById(userId);
    const cafe = database.getCafeById(cafeId);
    
    if (!user || !cafe) {
        return res.status(400).json({ error: 'Usuario o cafetería no válidos' });
    }
    
    try {
        // Calcular total usando ProductFactory
        const products = items.map(item => {
            try {
                const product = ProductFactory.createProduct(item);
                return {
                    name: product.name,
                    price: product.price,
                    description: product.getDescription()
                };
            } catch {
                // Si no hay factory registrado, usar datos directos
                return {
                    name: item.name,
                    price: item.price,
                    description: `${item.name} - $${item.price}`
                };
            }
        });
        
        const total = products.reduce((sum, p) => sum + p.price, 0);
        
        const order = await database.createOrder({
            userId,
            cafeId,
            products,
            total,
            orderType: type
        });
        
        // Agregar sello automáticamente
        await database.addStamp({
            userId,
            cafeId,
            type: 'regular',
            orderTotal: total
        });
        
        res.status(201).json({
            success: true,
            order,
            message: '¡Orden creada y sello agregado!'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- Reseñas (Memento Pattern) ---
app.get('/api/reviews', (req, res) => {
    const { cafeId, userId } = req.query;
    if (userId && !requireCurrentUser(req, res, userId)) return;
    
    let reviews;
    if (cafeId) {
        reviews = database.getReviewsByCafe(cafeId);
    } else if (userId) {
        reviews = database.getReviewsByUser(userId);
    } else {
        reviews = database.getReviews();
    }
    
    const users = database.getUsers();
    const cafes = database.getCafes();
    
    const reviewsWithDetails = reviews.map(review => {
        const user = users.find(u => u.id === review.userId);
        const cafe = cafes.find(c => c.id === review.cafeId);
        return {
            ...review,
            userName: user?.name || 'Anónimo',
            userAvatar: user?.avatar,
            cafeName: cafe?.name
        };
    });
    
    res.json(reviewsWithDetails);
});

app.get('/api/reviews/:cafeId', (req, res) => {
    const reviews = database.getReviewsByCafe(req.params.cafeId);
    const users = database.getUsers();
    
    const reviewsWithUser = reviews.map(review => {
        const user = users.find(u => u.id === review.userId);
        return {
            ...review,
            userName: user?.name || 'Anónimo',
            userAvatar: user?.avatar
        };
    });
    
    res.json(reviewsWithUser);
});

app.post('/api/reviews', async (req, res) => {
    const { userId, cafeId, text, rating, tags = [] } = req.body;
    if (!requireCurrentUser(req, res, userId)) return;
    
    const user = database.getUserById(userId);
    const cafe = database.getCafeById(cafeId);
    
    if (!user || !cafe) {
        return res.status(400).json({ error: 'Usuario o cafetería no válidos' });
    }
    
    if (!text || !rating) {
        return res.status(400).json({ error: 'Texto y rating son requeridos' });
    }
    
    try {
        const review = await database.createReview({
            userId,
            cafeId,
            text,
            rating: parseInt(rating),
            tags
        });
        
        // Guardar snapshot inicial (Memento)
        await database.saveReviewSnapshot(review.id, review, 'Reseña creada');
        
        // Actualizar rating del café
        const allReviews = database.getReviewsByCafe(cafeId);
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await database.updateCafeRating(cafeId, Math.round(avgRating * 10) / 10);
        
        res.status(201).json({
            success: true,
            review: {
                ...review,
                userName: user.name,
                userAvatar: user.avatar
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/reviews/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
    const { text, rating, tags } = req.body;
    
    const review = database.getReviewById(reviewId);
    if (!review) {
        return res.status(404).json({ error: 'Reseña no encontrada' });
    }
    if (!requireCurrentUser(req, res, review.userId)) return;
    
    // Guardar snapshot antes de modificar (Memento)
    await database.saveReviewSnapshot(reviewId, review, 'Antes de edición');
    
    const updates = {};
    if (text !== undefined) updates.text = text;
    if (rating !== undefined) updates.rating = parseInt(rating);
    if (tags !== undefined) updates.tags = tags;
    
    const updatedReview = await database.updateReview(reviewId, updates);
    const history = database.getReviewHistory(reviewId);
    
    res.json({
        success: true,
        review: updatedReview,
        canUndo: history.length > 1,
        historyCount: history.length
    });
});

app.post('/api/reviews/:reviewId/undo', async (req, res) => {
    const { reviewId } = req.params;
    const review = database.getReviewById(reviewId);
    if (!review) {
        return res.status(404).json({ error: 'Reseña no encontrada' });
    }
    if (!requireCurrentUser(req, res, review.userId)) return;
    
    const history = database.getReviewHistory(reviewId);
    if (history.length < 2) {
        return res.json({
            success: false,
            message: 'No hay cambios para deshacer'
        });
    }
    
    // Obtener el estado anterior (penúltimo)
    const previousState = history[history.length - 2].state;
    
    // Restaurar
    const restoredReview = await database.updateReview(reviewId, {
        text: previousState.text,
        rating: previousState.rating,
        tags: previousState.tags
    });
    
    res.json({
        success: true,
        message: 'Cambio deshecho',
        review: restoredReview,
        historyCount: history.length
    });
});

app.get('/api/reviews/:reviewId/history', (req, res) => {
    const { reviewId } = req.params;
    const review = database.getReviewById(reviewId);
    if (!review) {
        return res.status(404).json({ error: 'Reseña no encontrada' });
    }
    if (!requireCurrentUser(req, res, review.userId)) return;

    const history = database.getReviewHistory(reviewId);
    
    res.json({
        reviewId,
        historyCount: history.length,
        history: history.map(h => ({
            savedAt: h.savedAt,
            reason: h.reason,
            rating: h.state.rating,
            textPreview: h.state.text?.substring(0, 50) + '...'
        }))
    });
});

// --- Información del Sistema ---
app.get('/api/info', (req, res) => {
    const stats = {
        users: database.getUsers().length,
        cafes: database.getCafes().length,
        orders: database.getOrders().length,
        reviews: database.getReviews().length,
        stamps: database.getStamps().length
    };
    
    res.json({
        name: 'BrewJourney API',
        version: '1.0.0',
        database: 'lowdb (JSON persistence)',
        stats,
        patterns: {
            factory: {
                productTypes: ProductFactory.getRegisteredTypes()
            },
            strategy: {
                currentRule: stampRuleContext.getRuleInfo(),
                ruleHistory: stampRuleContext.getRuleHistory()
            },
            memento: {
                description: 'Review history with undo capability'
            }
        }
    });
});

// --- Estadísticas del usuario ---
app.get('/api/stats/:userId', (req, res) => {
    if (!requireCurrentUser(req, res, req.params.userId)) return;

    const stats = database.getUserStats(req.params.userId);
    res.json(stats);
});

// Frontend estático después de las rutas /api (serve-static no enruta POST a /api/*).
app.use(express.static('frontend'));

// ===== Iniciar Servidor =====
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║           ☕ BrewJourney Server v1.0                     ║
╠══════════════════════════════════════════════════════════╣
║  API:      http://localhost:${PORT}/api                    ║
║  Frontend: http://localhost:${PORT}                        ║
╠══════════════════════════════════════════════════════════╣
║  Autenticación: JWT (POST /api/auth/login, demo password) ║
║  Base de datos: lowdb (data/db.json)                     ║
║  Patrones implementados:                                 ║
║    • Factory Method (productos y órdenes)                ║
║    • Strategy (reglas de sellos)                         ║
║    • Memento (historial de reseñas)                      ║
╚══════════════════════════════════════════════════════════╝
    `);
});

export default app;
