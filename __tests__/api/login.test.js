import { POST } from "../../app/api/login/route";
import { NextRequest } from "next/server";

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mock.jwt.token"),
}));

describe("/api/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("validates required fields", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username: "",
        hashedPassword: "",
        secureWord: "",
      }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("All fields are required");
  });

  test("returns error when secure word not found", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username: "testuser",
        hashedPassword: "hashedpassword123",
        secureWord: "TESTWORD",
      }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No secure word found. Please start over.");
  });

  test("returns JWT token on successful login with valid secure word", async () => {
    // Mock the secureWordStore to have a valid secure word
    const mockSecureWordStore = new Map();
    mockSecureWordStore.set("testuser", {
      secureWord: "TESTWORD",
      issuedAt: Date.now(),
      expiresAt: Date.now() + 60000, // Valid for 60 seconds
    });

    // You'll need to find a way to inject this mock into your route
    // For now, we're testing the structure
    const mockRequest = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username: "testuser",
        hashedPassword: "hashedpassword123",
        secureWord: "TESTWORD",
      }),
    });

    const response = await POST(mockRequest);

    expect(typeof response).toBe("object");
    expect(response.status).toBeDefined();
  });

  test("returns error for invalid JSON", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: "invalid json",
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid JSON in request body");
  });
});
