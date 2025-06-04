// app/api/login/route.ts - FIXED VERSION
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { secureWordStore } from "@/lib/globalStore";

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

    const { username, hashedPassword, secureWord } = body;
    console.log("🔍 LOGIN - Received data:", { username, hashedPassword: "***", secureWord });

    if (!username || !hashedPassword || !secureWord) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    console.log("💾 LOGIN - Global store size:", secureWordStore.size);
    console.log("💾 LOGIN - All stored usernames:", Array.from(secureWordStore.keys()));
    console.log("🔍 LOGIN - Looking for username:", username);

    // Check if secure word exists and is valid
    const storedData = secureWordStore.get(username);
    console.log("📖 LOGIN - Retrieved data:", storedData);

    if (!storedData) {
      return Response.json(
        {
          error: "No secure word found. Please start over.",
          debug: {
            requestedUsername: username,
            storeSize: secureWordStore.size,
            storedUsernames: Array.from(secureWordStore.keys()),
            storeContents: Array.from(secureWordStore.entries())
          }
        },
        { status: 400 }
      );
    }

    // Check if secure word has expired
    const now = Date.now();
    console.log("⏰ LOGIN - Time check:", {
      now,
      expiresAt: storedData.expiresAt,
      expired: now > storedData.expiresAt,
      timeRemaining: Math.max(0, storedData.expiresAt - now)
    });

    if (now > storedData.expiresAt) {
      secureWordStore.delete(username);
      return Response.json(
        { error: "Secure word has expired. Please start over." },
        { status: 400 }
      );
    }

    // Verify secure word
    console.log("🔑 LOGIN - Secure word check:", {
      received: secureWord,
      stored: storedData.secureWord,
      match: storedData.secureWord === secureWord
    });

    if (storedData.secureWord !== secureWord) {
      return Response.json({ error: "Invalid secure word" }, { status: 400 });
    }

    // For demo purposes, accept any password that's been hashed
    if (!hashedPassword || hashedPassword.length < 10) {
      return Response.json({ error: "Invalid password" }, { status: 400 });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || "demo-jwt-secret";
    const token = jwt.sign(
      {
        username,
        loginTime: now,
        step: "password_verified",
      },
      secret,
      { expiresIn: "1h" }
    );

    // Clean up used secure word
    secureWordStore.delete(username);
    console.log("✅ LOGIN - Success! Cleaned up secure word.");

    return Response.json({
      token,
      message: "Password verified. Please complete MFA.",
      requiresMfa: true,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}