// app/api/verifyMfa/route.ts - FIXED VERSION
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { mfaStore } from "@/lib/globalStore";

// Mock function to generate MFA code
function generateMfaCode(secret: string, username: string): string {
    // Use current time window (30 seconds) for TOTP-like behavior
    const timeWindow = Math.floor(Date.now() / 30000);
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(username + timeWindow.toString());
    const hash = hmac.digest("hex");

    // Extract 6 digits
    const offset = parseInt(hash.substring(hash.length - 1), 16) % (hash.length - 6);
    const code = hash.substring(offset, offset + 6);
    return code.toUpperCase();
}

export async function POST(req: NextRequest) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            console.error("❌ MFA - Invalid JSON:", e);
            return Response.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        console.log("🔍 MFA - Received body:", body);
        const { username, code, token } = body;

        // Debug what we received
        console.log("🔍 MFA - Parsed fields:", {
            username: username || "MISSING",
            code: code || "MISSING",
            token: token ? "PROVIDED" : "MISSING"
        });

        if (!username || !code || !token) {
            return Response.json(
                {
                    error: "Username, code, and token are required",
                    received: { username: !!username, code: !!code, token: !!token }
                },
                { status: 400 }
            );
        }

        // Verify JWT token
        const secret = process.env.JWT_SECRET || "demo-jwt-secret";
        let decoded;
        try {
            decoded = jwt.verify(token, secret) as any;
            console.log("✅ MFA - Token verified for user:", decoded.username);
        } catch (error) {
            console.error("❌ MFA - Token verification failed:", error);
            return Response.json({ error: "Invalid token" }, { status: 401 });
        }

        if (decoded.username !== username) {
            console.error("❌ MFA - Username mismatch:", { tokenUser: decoded.username, providedUser: username });
            return Response.json({ error: "Token username mismatch" }, { status: 401 });
        }

        // Check MFA attempts
        let mfaData = mfaStore.get(username);
        console.log("🔍 MFA - Stored MFA data:", mfaData);

        if (!mfaData) {
            // Generate a new MFA code for this user
            const mfaSecret = process.env.MFA_SECRET || "demo-mfa-secret";
            const validCode = generateMfaCode(mfaSecret, username);
            console.log("🔑 MFA - Generated new code:", validCode);

            mfaData = {
                username,
                code: validCode,
                generatedAt: Date.now(),
                attempts: 0,
            };
            mfaStore.set(username, mfaData);
        }

        // Check if locked out (3 attempts max)
        if (mfaData.attempts >= 3) {
            console.log("🔒 MFA - Account locked for user:", username);
            return Response.json(
                { error: "Account locked due to too many failed attempts" },
                { status: 423 }
            );
        }

        // Verify the code
        console.log("🔍 MFA - Code comparison:", {
            received: code.toUpperCase(),
            expected: mfaData.code,
            match: code.toUpperCase() === mfaData.code
        });

        if (code.toUpperCase() !== mfaData.code) {
            mfaData.attempts++;
            mfaStore.set(username, mfaData);

            const remainingAttempts = 3 - mfaData.attempts;
            console.log(`❌ MFA - Invalid code, ${remainingAttempts} attempts remaining`);

            if (remainingAttempts === 0) {
                return Response.json(
                    { error: "Account locked due to too many failed attempts" },
                    { status: 423 }
                );
            }

            return Response.json(
                {
                    error: `Invalid MFA code. ${remainingAttempts} attempts remaining.`,
                    remainingAttempts,
                    hint: `Expected: ${mfaData.code}` // Remove this in production!
                },
                { status: 400 }
            );
        }

        // Success - generate final session token
        const sessionToken = jwt.sign(
            {
                username,
                loginTime: Date.now(),
                authenticated: true,
                mfaVerified: true,
            },
            secret,
            { expiresIn: "24h" }
        );

        // Clean up MFA data
        mfaStore.delete(username);
        console.log("✅ MFA - Login successful for user:", username);

        return Response.json({
            sessionToken,
            message: "Login successful",
            redirectTo: "/dashboard",
        });

    } catch (error) {
        console.error("❌ MFA verification API error:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET method to retrieve current MFA code for demo purposes
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");
    console.log("🔍 MFA GET - Username:", username);

    if (!username) {
        return Response.json({ error: "Username required" }, { status: 400 });
    }

    // Generate current MFA code for demo
    const mfaSecret = process.env.MFA_SECRET || "demo-mfa-secret";
    const currentCode = generateMfaCode(mfaSecret, username);
    console.log("🔑 MFA GET - Generated code:", currentCode);

    // Store the code for verification
    mfaStore.set(username, {
        username,
        code: currentCode,
        generatedAt: Date.now(),
        attempts: 0,
    });

    return Response.json({
        code: currentCode,
        message: "MFA code generated for demo purposes",
    });
}