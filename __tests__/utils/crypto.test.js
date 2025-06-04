import CryptoJS from "crypto-js";

// Don't mock crypto-js for this specific test
jest.unmock("crypto-js");

describe("Password Hashing", () => {
  test("generates consistent hash for same input", () => {
    const password = "testpassword123";

    const hash1 = CryptoJS.SHA256(password).toString();
    const hash2 = CryptoJS.SHA256(password).toString();

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA256 produces 64-character hex string
  });

  test("generates different hashes for different inputs", () => {
    const password1 = "password1";
    const password2 = "password2";

    const hash1 = CryptoJS.SHA256(password1).toString();
    const hash2 = CryptoJS.SHA256(password2).toString();

    expect(hash1).not.toBe(hash2);
  });
});
