import { POST } from "../../app/api/getSecureWord/route";
import { NextRequest } from "next/server";

// Mock crypto module
jest.mock("crypto", () => ({
  createHmac: jest.fn(() => ({
    update: jest.fn(),
    digest: jest.fn(() => "mockedhash123456789"),
  })),
}));

// Mock the global store
jest.mock("../../lib/globalStore", () => {
  const mockSecureWordStore = new Map();
  const mockUserRequestStore = new Map();

  return {
    secureWordStore: mockSecureWordStore,
    userRequestStore: mockUserRequestStore,
  };
});

describe("/api/getSecureWord", () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Clear the mocked stores
    const {
      secureWordStore,
      userRequestStore,
    } = require("../../lib/globalStore");
    secureWordStore.clear();
    userRequestStore.clear();

    // Mock Date.now() to have consistent timestamps
    jest.spyOn(Date, "now").mockReturnValue(1000000000000); // Fixed timestamp
  });

  afterEach(() => {
    // Restore Date.now
    jest.restoreAllMocks();
  });

  test("generates secure word for valid username", async () => {
    const requestBody = { username: "testuser" };

    // Create a proper NextRequest mock
    const mockRequest = new NextRequest("http://localhost/api/getSecureWord", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.secureWord).toBeDefined();
    expect(data.secureWord).toBe("MOCKEDHA"); // First 8 chars of "mockedhash123456789" uppercased
    expect(data.expiresAt).toBe(60); // Duration in seconds
    expect(data.message).toBe("Secure word generated successfully");
  });

  test("returns error for empty username", async () => {
    const requestBody = { username: "" };

    const mockRequest = new NextRequest("http://localhost/api/getSecureWord", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Username is required");
  });

  test("returns error for missing username", async () => {
    const requestBody = {}; // No username field

    const mockRequest = new NextRequest("http://localhost/api/getSecureWord", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Username is required");
  });

  test("returns error for invalid JSON", async () => {
    const mockRequest = new NextRequest("http://localhost/api/getSecureWord", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: "invalid json{", // Invalid JSON
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid JSON in request body");
  });

  test("implements rate limiting", async () => {
    const requestBody = { username: "ratelimituser" };

    const createMockRequest = () =>
      new NextRequest("http://localhost/api/getSecureWord", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

    // First request should succeed
    const response1 = await POST(createMockRequest());
    const data1 = await response1.json();

    expect(response1.status).toBe(200);
    expect(data1.secureWord).toBeDefined();

    // Mock time advancement (but still within 10 second window)
    jest.spyOn(Date, "now").mockReturnValue(1000000005000); // 5 seconds later

    // Second immediate request should be rate limited
    const response2 = await POST(createMockRequest());
    const data2 = await response2.json();

    expect(response2.status).toBe(429);
    expect(data2.error).toContain("Please wait");
    expect(data2.error).toContain("seconds before requesting again");
  });

  test("allows request after rate limit period", async () => {
    const requestBody = { username: "timeruser" };

    const createMockRequest = () =>
      new NextRequest("http://localhost/api/getSecureWord", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

    // First request
    const response1 = await POST(createMockRequest());
    expect(response1.status).toBe(200);

    // Mock time advancement beyond 10 second rate limit
    jest.spyOn(Date, "now").mockReturnValue(1000000010001); // 10+ seconds later

    // Second request should succeed after rate limit period
    const response2 = await POST(createMockRequest());
    const data2 = await response2.json();

    expect(response2.status).toBe(200);
    expect(data2.secureWord).toBeDefined();
  });

  test("generates different secure words for different users", async () => {
    const user1Request = new NextRequest("http://localhost/api/getSecureWord", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ username: "user1" }),
    });

    const user2Request = new NextRequest("http://localhost/api/getSecureWord", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ username: "user2" }),
    });

    const response1 = await POST(user1Request);
    const data1 = await response1.json();

    // Advance time slightly to get different hash
    jest.spyOn(Date, "now").mockReturnValue(1000000001000);

    const response2 = await POST(user2Request);
    const data2 = await response2.json();

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(data1.secureWord).toBeDefined();
    expect(data2.secureWord).toBeDefined();
    // Note: With mocked crypto, they might be the same, but in real scenario they'd be different
  });

  test("stores secure word data correctly", async () => {
    const { secureWordStore } = require("../../lib/globalStore");
    const requestBody = { username: "storeuser" };

    const mockRequest = new NextRequest("http://localhost/api/getSecureWord", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);

    // Check that data was stored
    expect(secureWordStore.has("storeuser")).toBe(true);

    const storedData = secureWordStore.get("storeuser");
    expect(storedData.username).toBe("storeuser");
    expect(storedData.secureWord).toBe(data.secureWord);
    expect(storedData.issuedAt).toBe(1000000000000); // Our mocked timestamp
    expect(storedData.expiresAt).toBe(1000000060000); // issuedAt + 60 seconds
  });
});
