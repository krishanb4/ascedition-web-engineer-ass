// app/api/getSecureWord/route.ts - FIXED VERSION
import { NextRequest } from "next/server";
import crypto from "crypto";
import { secureWordStore, userRequestStore, type SecureWordData } from "@/lib/globalStore";

export async function POST(req: NextRequest) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return Response.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        const { username } = body;
        console.log("🔍 GET SECURE WORD - Username received:", username);

        if (!username || typeof username !== "string") {
            return Response.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        const now = Date.now();

        // Check rate limiting (10 seconds between requests)
        const lastRequest = userRequestStore.get(username);
        if (lastRequest && (now - lastRequest.lastRequestAt) < 10000) {
            const waitTime = Math.ceil((10000 - (now - lastRequest.lastRequestAt)) / 1000);
            return Response.json(
                { error: `Please wait ${waitTime} seconds before requesting again` },
                { status: 429 }
            );
        }

        // Generate secure word using HMAC
        const secret = process.env.SECURE_WORD_SECRET || "demo-secret-key";
        const timestamp = now.toString();
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(username + timestamp);
        const hash = hmac.digest("hex");

        // Take first 8 characters and make it uppercase for readability
        const secureWord = hash.substring(0, 8).toUpperCase();
        console.log("🔑 Generated secure word:", secureWord);

        // Store the secure word with expiration (60 seconds)
        const expirationDuration = 60; // 60 seconds
        const expiresAt = now + (expirationDuration * 1000); // Convert to milliseconds for internal storage

        const dataToStore: SecureWordData = {
            username,
            secureWord,
            issuedAt: now,
            expiresAt,
        };

        secureWordStore.set(username, dataToStore);
        console.log("💾 Stored data for username:", username);
        console.log("💾 Global store size after storing:", secureWordStore.size);
        console.log("💾 All stored usernames:", Array.from(secureWordStore.keys()));

        // Update user request timestamp
        userRequestStore.set(username, {
            username,
            lastRequestAt: now,
        });

        // Return the response with expiresAt as duration in seconds (for tests)
        // and expiresAtTimestamp for frontend use
        return Response.json({
            secureWord,
            expiresAt: expirationDuration, // This is what tests expect (60 seconds)
            expiresAtTimestamp: expiresAt,  // Frontend can use this for countdown
            message: "Secure word generated successfully"
        });

    } catch (error) {
        console.error("Get secure word API error:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}