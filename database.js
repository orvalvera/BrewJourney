/**
 * BrewJourney - Database Module
 * Base de datos JSON persistente usando lowdb
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Estructura inicial de la base de datos
const defaultData = {
  users: [
    {
      id: 'u1',
      name: 'Samuel Orval',
      email: 'orval@brewjourney.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Samuel',
      createdAt: new Date().toISOString()
    },
    {
      id: 'u2',
      name: 'Karla Nava',
      email: 'karla@brewjourney.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karla',
      createdAt: new Date().toISOString()
    },
    {
      id: 'u3',
      name: 'Ximena García',
      email: 'ximena@brewjourney.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ximena',
      createdAt: new Date().toISOString()
    },
    {
      id: 'u4',
      name: 'Jesús Escobar',
      email: 'jesus@brewjourney.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jesus',
      createdAt: new Date().toISOString()
    }
  ],
  cafes: [
    {
      id: 'c1',
      name: 'Starbucks',
      location: 'Av. Temozon Norte #123',
      image: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400',
      rating: 4.5,
      totalReviews: 128,
      description: 'La cadena de café más famosa del mundo, con ambiente acogedor y WiFi gratuito.'
    },
    {
      id: 'c2',
      name: 'The Italian Coffee',
      location: 'Plaza Altabrisa Local 45',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
      rating: 4.8,
      totalReviews: 89,
      description: 'Auténtico café italiano con los mejores espressos de la ciudad.'
    },
    {
      id: 'c3',
      name: 'Café Punta del Cielo',
      location: 'Centro Histórico #78',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
      rating: 4.2,
      totalReviews: 156,
      description: 'Café 100% mexicano de altura, cultivado en Chiapas.'
    },
    {
      id: 'c4',
      name: 'Cielito Querido',
      location: 'Plaza Fiesta Local 12',
      image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
      rating: 4.6,
      totalReviews: 203,
      description: 'Café mexicano con pan dulce tradicional y ambiente nostálgico.'
    },
    {
      id: 'c5',
      name: 'Café Britt',
      location: 'Paseo Montejo #456',
      image: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=400',
      rating: 4.4,
      totalReviews: 67,
      description: 'Café gourmet de Costa Rica con granos de alta calidad.'
    }
  ],
  products: [
    { id: 'p1', name: 'Cappuccino', price: 4.50, type: 'beverage', size: 'medium', icon: 'fa-mug-hot' },
    { id: 'p2', name: 'Latte', price: 4.00, type: 'beverage', size: 'medium', icon: 'fa-mug-hot' },
    { id: 'p3', name: 'Espresso', price: 2.50, type: 'beverage', size: 'small', icon: 'fa-mug-hot' },
    { id: 'p4', name: 'Americano', price: 3.00, type: 'beverage', size: 'medium', icon: 'fa-mug-hot' },
    { id: 'p5', name: 'Mocha', price: 5.00, type: 'beverage', size: 'large', icon: 'fa-mug-hot' },
    { id: 'p6', name: 'Frappuccino', price: 5.50, type: 'beverage', size: 'large', icon: 'fa-blender' },
    { id: 'p7', name: 'Croissant', price: 3.00, type: 'snack', flavor: 'butter', icon: 'fa-bread-slice' },
    { id: 'p8', name: 'Croissant Almendra', price: 3.50, type: 'snack', flavor: 'almond', icon: 'fa-bread-slice' },
    { id: 'p9', name: 'Tiramisu', price: 6.00, type: 'dessert', typeCategory: 'italian', icon: 'fa-cake-candles' },
    { id: 'p10', name: 'Cheesecake', price: 5.50, type: 'dessert', typeCategory: 'sweet', icon: 'fa-cake-candles' },
    { id: 'p11', name: 'Brownie', price: 4.00, type: 'dessert', typeCategory: 'chocolate', icon: 'fa-cookie' },
    { id: 'p12', name: 'Galletas Choco', price: 2.00, type: 'snack', flavor: 'chocolate', icon: 'fa-cookie-bite' },
    { id: 'p13', name: 'Taza BrewJourney', price: 15.00, type: 'merchandise', category: 'mug', icon: 'fa-mug-saucer' },
    { id: 'p14', name: 'Tumbler 500ml', price: 22.00, type: 'merchandise', category: 'tumbler', icon: 'fa-bottle-water' }
  ],
  stamps: [
    // Sellos de ejemplo para Samuel (u1)
    { id: 's1', userId: 'u1', cafeId: 'c1', date: '2026-02-24', type: 'regular' },
    { id: 's2', userId: 'u1', cafeId: 'c1', date: '2026-02-23', type: 'regular' },
    { id: 's3', userId: 'u1', cafeId: 'c1', date: '2026-02-22', type: 'regular' },
    { id: 's4', userId: 'u1', cafeId: 'c1', date: '2026-02-21', type: 'regular' },
    { id: 's5', userId: 'u1', cafeId: 'c1', date: '2026-02-20', type: 'regular' },
    { id: 's6', userId: 'u1', cafeId: 'c2', date: '2026-02-24', type: 'regular' },
    { id: 's7', userId: 'u1', cafeId: 'c2', date: '2026-02-22', type: 'regular' },
    { id: 's8', userId: 'u1', cafeId: 'c2', date: '2026-02-20', type: 'regular' },
    { id: 's9', userId: 'u1', cafeId: 'c3', date: '2026-02-23', type: 'regular' },
    { id: 's10', userId: 'u1', cafeId: 'c3', date: '2026-02-21', type: 'regular' },
    { id: 's11', userId: 'u1', cafeId: 'c4', date: '2026-02-24', type: 'bonus' },
    { id: 's12', userId: 'u1', cafeId: 'c4', date: '2026-02-22', type: 'regular' }
  ],
  orders: [
    {
      id: 'ord_001',
      userId: 'u1',
      cafeId: 'c1',
      products: [
        { name: 'Cappuccino', price: 4.50 },
        { name: 'Croissant', price: 3.00 }
      ],
      total: 7.50,
      status: 'completed',
      orderType: 'dine-in',
      createdAt: '2026-02-24T10:30:00Z'
    },
    {
      id: 'ord_002',
      userId: 'u1',
      cafeId: 'c2',
      products: [
        { name: 'Latte', price: 4.00 },
        { name: 'Tiramisu', price: 6.00 }
      ],
      total: 10.00,
      status: 'completed',
      orderType: 'takeout',
      createdAt: '2026-02-23T15:45:00Z'
    },
    {
      id: 'ord_003',
      userId: 'u1',
      cafeId: 'c3',
      products: [
        { name: 'Americano', price: 3.00 },
        { name: 'Brownie', price: 4.00 },
        { name: 'Galletas Choco', price: 2.00 }
      ],
      total: 9.00,
      status: 'completed',
      orderType: 'dine-in',
      createdAt: '2026-02-22T09:15:00Z'
    }
  ],
  reviews: [
    {
      id: 'rev_001',
      userId: 'u1',
      cafeId: 'c1',
      rating: 5,
      text: 'Excelente café y ambiente muy acogedor. El WiFi es rápido y perfecto para trabajar.',
      tags: ['acogedor', 'wifi', 'silencioso'],
      images: [],
      createdAt: '2026-02-24T11:00:00Z',
      updatedAt: '2026-02-24T11:00:00Z'
    },
    {
      id: 'rev_002',
      userId: 'u1',
      cafeId: 'c2',
      rating: 5,
      text: 'El mejor tiramisu que he probado. El espresso es auténtico italiano.',
      tags: ['comida', 'acogedor'],
      images: [],
      createdAt: '2026-02-23T16:00:00Z',
      updatedAt: '2026-02-23T16:00:00Z'
    },
    {
      id: 'rev_003',
      userId: 'u1',
      cafeId: 'c3',
      rating: 4,
      text: 'Buen café mexicano, aunque a veces hay mucha gente.',
      tags: ['comida'],
      images: [],
      createdAt: '2026-02-22T10:00:00Z',
      updatedAt: '2026-02-22T10:00:00Z'
    }
  ],
  reviewHistory: [],
  settings: {
    currentStampRule: 'basic',
    stampRuleHistory: []
  }
};

// Inicializar base de datos
const file = join(__dirname, 'data', 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, defaultData);

// Leer datos existentes o crear con defaults
await db.read();

// Si no hay datos, usar los defaults
if (!db.data || Object.keys(db.data).length === 0) {
  db.data = defaultData;
  await db.write();
}

// Funciones de utilidad para la base de datos
export const database = {
  // Obtener la instancia de la BD
  getInstance: () => db,
  
  // Guardar cambios
  save: async () => {
    await db.write();
  },
  
  // ===== USERS =====
  getUsers: () => db.data.users,
  
  getUserById: (id) => db.data.users.find(u => u.id === id),
  
  createUser: async (user) => {
    const newUser = {
      id: `u${Date.now()}`,
      ...user,
      createdAt: new Date().toISOString()
    };
    db.data.users.push(newUser);
    await db.write();
    return newUser;
  },
  
  // ===== CAFES =====
  getCafes: () => db.data.cafes,
  
  getCafeById: (id) => db.data.cafes.find(c => c.id === id),
  
  updateCafeRating: async (cafeId, newRating) => {
    const cafe = db.data.cafes.find(c => c.id === cafeId);
    if (cafe) {
      cafe.rating = newRating;
      cafe.totalReviews++;
      await db.write();
    }
    return cafe;
  },
  
  // ===== PRODUCTS =====
  getProducts: () => db.data.products,
  
  getProductsByType: (type) => db.data.products.filter(p => p.type === type),
  
  // ===== STAMPS =====
  getStamps: () => db.data.stamps,
  
  getStampsByUser: (userId) => db.data.stamps.filter(s => s.userId === userId),
  
  getStampsByCafe: (cafeId) => db.data.stamps.filter(s => s.cafeId === cafeId),
  
  getStampsByUserAndCafe: (userId, cafeId) => 
    db.data.stamps.filter(s => s.userId === userId && s.cafeId === cafeId),
  
  hasStampToday: (userId, cafeId) => {
    const today = new Date().toISOString().split('T')[0];
    return db.data.stamps.some(s => 
      s.userId === userId && s.cafeId === cafeId && s.date === today
    );
  },
  
  addStamp: async (stamp) => {
    const newStamp = {
      id: `s${Date.now()}`,
      ...stamp,
      date: stamp.date || new Date().toISOString().split('T')[0]
    };
    db.data.stamps.push(newStamp);
    await db.write();
    return newStamp;
  },
  
  // ===== ORDERS =====
  getOrders: () => db.data.orders,
  
  getOrdersByUser: (userId) => 
    db.data.orders.filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  
  getOrderById: (id) => db.data.orders.find(o => o.id === id),
  
  createOrder: async (order) => {
    const newOrder = {
      id: `ord_${Date.now()}`,
      ...order,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    db.data.orders.push(newOrder);
    await db.write();
    return newOrder;
  },
  
  // ===== REVIEWS =====
  getReviews: () => db.data.reviews,
  
  getReviewsByCafe: (cafeId) => 
    db.data.reviews.filter(r => r.cafeId === cafeId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  
  getReviewsByUser: (userId) => db.data.reviews.filter(r => r.userId === userId),
  
  getReviewById: (id) => db.data.reviews.find(r => r.id === id),
  
  createReview: async (review) => {
    const now = new Date().toISOString();
    const newReview = {
      id: `rev_${Date.now()}`,
      ...review,
      images: review.images || [],
      tags: review.tags || [],
      createdAt: now,
      updatedAt: now
    };
    db.data.reviews.push(newReview);
    await db.write();
    return newReview;
  },
  
  updateReview: async (id, updates) => {
    const review = db.data.reviews.find(r => r.id === id);
    if (review) {
      // Guardar en historial antes de modificar
      db.data.reviewHistory.push({
        reviewId: id,
        state: { ...review },
        savedAt: new Date().toISOString()
      });
      
      Object.assign(review, updates, { updatedAt: new Date().toISOString() });
      await db.write();
    }
    return review;
  },
  
  // ===== REVIEW HISTORY (Memento) =====
  getReviewHistory: (reviewId) => 
    db.data.reviewHistory.filter(h => h.reviewId === reviewId),
  
  saveReviewSnapshot: async (reviewId, state, reason = 'Manual') => {
    db.data.reviewHistory.push({
      reviewId,
      state: { ...state },
      reason,
      savedAt: new Date().toISOString()
    });
    await db.write();
  },
  
  // ===== SETTINGS =====
  getSettings: () => db.data.settings,
  
  updateSettings: async (updates) => {
    Object.assign(db.data.settings, updates);
    await db.write();
    return db.data.settings;
  },
  
  // ===== STATS =====
  getUserStats: (userId) => {
    const stamps = db.data.stamps.filter(s => s.userId === userId);
    const orders = db.data.orders.filter(o => o.userId === userId);
    const reviews = db.data.reviews.filter(r => r.userId === userId);
    const uniqueCafes = new Set(stamps.map(s => s.cafeId));
    
    return {
      totalStamps: stamps.length,
      totalOrders: orders.length,
      totalReviews: reviews.length,
      cafesVisited: uniqueCafes.size,
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0)
    };
  }
};

export default database;
