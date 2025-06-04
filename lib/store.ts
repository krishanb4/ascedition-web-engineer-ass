interface SecureWordData {
    username: string;
    secureWord: string;
    issuedAt: number;
    expiresAt: number;
}

interface MfaData {
    username: string;
    code: string;
    generatedAt: number;
    attempts: number;
}

interface UserRequest {
    username: string;
    lastRequestAt: number;
}

// Shared stores
export const secureWordStore = new Map<string, SecureWordData>();
export const mfaStore = new Map<string, MfaData>();
export const userRequestStore = new Map<string, UserRequest>();

// Cleanup expired entries periodically
setInterval(() => {
    const now = Date.now();

    // Clean up expired secure words
    for (const [key, data] of secureWordStore.entries()) {
        if (now > data.expiresAt) {
            secureWordStore.delete(key);
        }
    }

    // Clean up old MFA codes (5 minutes)
    for (const [key, data] of mfaStore.entries()) {
        if (now - data.generatedAt > 5 * 60 * 1000) {
            mfaStore.delete(key);
        }
    }

    // Clean up old user requests (1 hour)
    for (const [key, data] of userRequestStore.entries()) {
        if (now - data.lastRequestAt > 60 * 60 * 1000) {
            userRequestStore.delete(key);
        }
    }
}, 60000); // Run cleanup every minute