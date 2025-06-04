import jwt from 'jsonwebtoken';

export interface UserPayload {
    username: string;
    authenticated: boolean;
    iat: number;
    exp: number;
}

export function verifyToken(token: string): UserPayload | null {
    try {
        const secret = process.env.JWT_SECRET || 'your-jwt-secret';
        const payload = jwt.verify(token, secret) as UserPayload;
        return payload;
    } catch (error) {
        return null;
    }
}

export function generateToken(username: string): string {
    const secret = process.env.JWT_SECRET || 'your-jwt-secret';
    return jwt.sign(
        {
            username,
            authenticated: true,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
        },
        secret
    );
}