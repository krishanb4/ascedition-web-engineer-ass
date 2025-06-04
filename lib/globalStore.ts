// lib/globalStore.ts
// Global store that persists across API routes

declare global {
    var secureWordStore: Map<string, any> | undefined;
    var mfaStore: Map<string, any> | undefined;
    var userRequestStore: Map<string, any> | undefined;
}

// Initialize global stores if they don't exist
if (!global.secureWordStore) {
    global.secureWordStore = new Map();
}

if (!global.mfaStore) {
    global.mfaStore = new Map();
}

if (!global.userRequestStore) {
    global.userRequestStore = new Map();
}

// Export the global stores
export const secureWordStore = global.secureWordStore;
export const mfaStore = global.mfaStore;
export const userRequestStore = global.userRequestStore;

// Types
export interface SecureWordData {
    username: string;
    secureWord: string;
    issuedAt: number;
    expiresAt: number;
}

export interface MfaData {
    username: string;
    code: string;
    generatedAt: number;
    attempts: number;
}

export interface UserRequest {
    username: string;
    lastRequestAt: number;
}