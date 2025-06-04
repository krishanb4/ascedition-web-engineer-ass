import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

// In-memory store for MFA codes
const mfaStore = new Map();

function generateMfaCode(username: string): string {
    const secret = 'mfa-secret-key';
    const timestamp = Math.floor(Date.now() / 30000); // 30-second window for TOTP
    const data = username + timestamp.toString();
    const hash = CryptoJS.HmacSHA256(data, secret).toString();
    const code = parseInt(hash.substring(0, 6), 16) % 1000000;
    return code.toString().padStart(6, '0');
}

export async function POST(request: NextRequest) {
    try {
        const { username } = await request.json();

        if (!username) {
            return NextResponse.json(
                { message: 'Username is required' },
                { status: 400 }
            );
        }

        const mfaCode = generateMfaCode(username);

        // Store MFA code with expiration (5 minutes)
        mfaStore.set(username, {
            code: mfaCode,
            attempts: 0,
            expiresAt: Date.now() + 300000, // 5 minutes
        });

        return NextResponse.json({
            success: true,
            mfaCode,
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}