import "@testing-library/jest-dom";

// Mock Headers class first - this is critical for NextRequest
global.Headers = class Headers {
  constructor(init = {}) {
    this._headers = new Map();
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this._headers.set(key.toLowerCase(), value);
      });
    }
  }

  get(name) {
    return this._headers.get(name?.toLowerCase()) || null;
  }

  set(name, value) {
    this._headers.set(name.toLowerCase(), value);
  }

  has(name) {
    return this._headers.has(name?.toLowerCase());
  }

  delete(name) {
    this._headers.delete(name?.toLowerCase());
  }

  entries() {
    return this._headers.entries();
  }

  keys() {
    return this._headers.keys();
  }

  values() {
    return this._headers.values();
  }

  [Symbol.iterator]() {
    return this._headers[Symbol.iterator]();
  }

  forEach(callback) {
    this._headers.forEach(callback);
  }
};

// Mock global Request and Response before any imports
global.Request = class Request {
  constructor(input, init = {}) {
    // Use Object.defineProperty to properly set the url property
    Object.defineProperty(this, "url", {
      value: input,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    this.method = init.method || "GET";
    this.headers = new Headers(init.headers || {});
    this._body = init.body;
  }

  async json() {
    return JSON.parse(this._body);
  }

  async text() {
    return this._body || "";
  }
};

global.Response = class Response {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || "OK";
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    return JSON.parse(this._body);
  }

  async text() {
    return this._body;
  }

  static json(data, init = {}) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "";
  },
}));

// Mock crypto-js for consistent testing
jest.mock("crypto-js", () => ({
  SHA256: jest.fn(() => ({
    toString: jest.fn(() => "mocked-hash-value"),
  })),
}));

// Mock environment variables
process.env.SECRET_KEY = "test-secret-key";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.MFA_SECRET = "test-mfa-secret";

// Clear global stores before each test
beforeEach(() => {
  if (typeof globalThis !== "undefined") {
    globalThis.secureWordStore = new Map();
    globalThis.rateLimitStore = new Map();
    globalThis.mfaAttempts = new Map();
    globalThis.mfaCodes = new Map();
  }
});
