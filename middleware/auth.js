/**
 * JWT demo (academic) — verificación y firma de tokens.
 * Secreto: variable de entorno JWT_SECRET o valor por defecto solo para local.
 */
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'brewjourney-demo-jwt-secret-not-for-production';

const DEMO_PASSWORD = 'demo';

export function signUserToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

export function authenticateToken(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token) {
        return res.status(401).json({ error: 'Token requerido (Authorization: Bearer …)' });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export function validateDemoLogin(password) {
    return password === DEMO_PASSWORD;
}
