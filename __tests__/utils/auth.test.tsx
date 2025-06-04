import { verifyToken, generateToken } from "@/lib/auth";

describe("Auth Utils", () => {
  test("generateToken creates valid JWT", () => {
    const username = "testuser";
    const token = generateToken(username);

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // JWT has 3 parts

    // Decode payload
    const payload = JSON.parse(atob(token.split(".")[1]));
    expect(payload.username).toBe(username);
    expect(payload.authenticated).toBe(true);
  });

  test("verifyToken validates correct token", () => {
    const username = "testuser";
    const token = generateToken(username);
    const payload = verifyToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.username).toBe(username);
    expect(payload?.authenticated).toBe(true);
  });

  test("verifyToken rejects invalid token", () => {
    const invalidToken = "invalid.token.here";
    const payload = verifyToken(invalidToken);

    expect(payload).toBeNull();
  });
});
