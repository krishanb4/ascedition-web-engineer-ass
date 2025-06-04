"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CryptoJS from "crypto-js";

// Define interfaces for form data and API responses
interface FormData {
  username: string;
  password: string;
  secureWord: string;
  mfaCode: string;
  sessionToken: string;
}

interface SecureWordResponse {
  secureWord: string;
  expiresIn: number;
  error?: string;
}

interface LoginResponse {
  token: string;
  message: string;
  error?: string;
}

interface MfaResponse {
  sessionToken?: string;
  success?: boolean;
  message: string;
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    secureWord: "",
    mfaCode: "",
    sessionToken: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [secureWordTimer, setSecureWordTimer] = useState<number>(60);
  const [mfaAttempts, setMfaAttempts] = useState<number>(0);
  const [currentMfaCode, setCurrentMfaCode] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number>(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      console.log("🔍 Checking existing authentication...");

      const token = localStorage.getItem("sessionToken");
      const username = localStorage.getItem("username");

      console.log("Auth check:", {
        hasToken: !!token,
        hasUsername: !!username,
        tokenPreview: token ? token.substring(0, 20) + "..." : "none",
      });

      if (token && username) {
        console.log("✅ User already authenticated, redirecting to dashboard");

        // Set cookies for middleware compatibility
        document.cookie = `sessionToken=${token}; path=/; max-age=86400; ${
          window.location.protocol === "https:" ? "secure;" : ""
        } samesite=strict`;

        document.cookie = `username=${username}; path=/; max-age=86400; ${
          window.location.protocol === "https:" ? "secure;" : ""
        } samesite=strict`;

        // Redirect to dashboard
        router.push("/dashboard");
        return;
      }

      console.log("❌ No valid authentication found, showing login form");
      setIsCheckingAuth(false);
    };

    checkAuthAndRedirect();
  }, [router]);

  // Fetch MFA code for demo purposes
  const fetchMfaCode = async () => {
    try {
      console.log("🔄 Fetching MFA code for user:", formData.username);
      const response = await fetch(
        `/api/verifyMfa?username=${encodeURIComponent(formData.username)}`
      );
      const data = await response.json();

      if (response.ok && data.code) {
        setCurrentMfaCode(data.code);
        console.log("🔑 Fetched MFA code:", data.code);
      } else {
        console.error("❌ Failed to fetch MFA code:", data);
      }
    } catch (error) {
      console.error("❌ Error fetching MFA code:", error);
    }
  };

  // Auto-fetch MFA code when entering step 4
  useEffect(() => {
    if (step === 4 && formData.username && !currentMfaCode) {
      fetchMfaCode();
    }
  }, [step, formData.username]);

  // Check lockout status
  useEffect(() => {
    if (lockoutEndTime > 0) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now >= lockoutEndTime) {
          setIsLocked(false);
          setLockoutEndTime(0);
          setMfaAttempts(0);
          setError("");
          console.log("🔓 Lockout period ended - user can try again");
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lockoutEndTime]);

  // Helper function to initiate lockout
  const initiateLockout = () => {
    const lockoutDuration = 60000; // 60 seconds
    const endTime = Date.now() + lockoutDuration;
    setIsLocked(true);
    setLockoutEndTime(endTime);
    setError(`Too many failed attempts. Try again in 60 seconds.`);
    console.log("🔒 User locked out for 60 seconds");
  };

  // Helper function to reset everything to initial state
  const resetToInitialState = () => {
    setStep(1);
    setMfaAttempts(0);
    setIsLocked(false);
    setLockoutEndTime(0);
    setCurrentMfaCode("");
    setFormData({
      username: "",
      password: "",
      secureWord: "",
      mfaCode: "",
      sessionToken: "",
    });
    setError("");
  };

  // Step 1: Username submission
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const requestBody = { username: formData.username };
      console.log("🔄 Sending username request:", requestBody);

      const response = await fetch("/api/getSecureWord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📨 Secure word response status:", response.status);

      const data: SecureWordResponse = await response.json();
      console.log("📨 Secure word response data:", data);

      if (response.ok) {
        setFormData((prev) => ({ ...prev, secureWord: data.secureWord }));
        setStep(2);

        // Start countdown timer
        const timer = setInterval(() => {
          setSecureWordTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setError("Secure word has expired. Please try again.");
              setStep(1);
              return 60;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error || "Failed to get secure word");
      }
    } catch (error) {
      console.error("❌ Username request error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Password submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password) {
      setError("Please enter a password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Hash password before sending
      const hashedPassword = CryptoJS.SHA256(formData.password).toString();

      const requestBody = {
        username: formData.username,
        hashedPassword,
        secureWord: formData.secureWord,
      };

      console.log("🔄 Sending login request:", requestBody);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📨 Login response status:", response.status);

      const data: LoginResponse = await response.json();
      console.log("📨 Login response data:", data);

      if (response.ok) {
        setFormData((prev) => ({ ...prev, sessionToken: data.token }));
        console.log(
          "✅ Login successful, token saved:",
          data.token ? "✓" : "✗"
        );
        // Reset MFA attempts when starting fresh MFA process
        setMfaAttempts(0);
        setStep(4);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("❌ Login request error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: MFA verification
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is locked out
    if (isLocked) {
      const remainingTime = Math.ceil((lockoutEndTime - Date.now()) / 1000);
      setError(`Please wait ${remainingTime} seconds before trying again.`);
      return;
    }

    if (!formData.mfaCode || formData.mfaCode.length !== 6) {
      setError("Please enter a 6-digit MFA code");
      return;
    }

    if (!formData.sessionToken) {
      setError("Session token missing. Please try logging in again.");
      setStep(1);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const requestBody = {
        username: formData.username,
        code: formData.mfaCode,
        token: formData.sessionToken,
      };

      console.log("🔄 Sending MFA request:", {
        username: requestBody.username,
        code: requestBody.code,
        hasToken: !!requestBody.token,
        attempt: mfaAttempts + 1,
      });

      const response = await fetch("/api/verifyMfa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📨 MFA Response status:", response.status);
      const data: MfaResponse = await response.json();
      console.log("📨 MFA Response data:", data);

      if (response.ok) {
        // Success - reset everything and proceed
        const finalToken = data.sessionToken || formData.sessionToken;
        localStorage.setItem("sessionToken", finalToken);
        localStorage.setItem("username", formData.username);

        // Set cookies for middleware
        document.cookie = `sessionToken=${finalToken}; path=/; max-age=86400; ${
          window.location.protocol === "https:" ? "secure;" : ""
        } samesite=strict`;

        document.cookie = `username=${
          formData.username
        }; path=/; max-age=86400; ${
          window.location.protocol === "https:" ? "secure;" : ""
        } samesite=strict`;

        console.log("✅ MFA successful - redirecting to dashboard");

        // Reset attempts on success
        setMfaAttempts(0);

        // Redirect to dashboard
        setTimeout(async () => {
          try {
            await router.push("/dashboard");
          } catch (error) {
            window.location.href = "/dashboard";
          }
        }, 100);
      } else {
        // Failed attempt - increment counter
        const newAttemptCount = mfaAttempts + 1;
        setMfaAttempts(newAttemptCount);

        console.log(`❌ MFA attempt ${newAttemptCount}/3 failed`);

        if (newAttemptCount >= 3) {
          // Lock out after 3 failed attempts
          initiateLockout();
        } else {
          // Show error with remaining attempts
          const remainingAttempts = 3 - newAttemptCount;
          setError(
            `${
              data.error || "MFA verification failed"
            }. ${remainingAttempts} attempt${
              remainingAttempts !== 1 ? "s" : ""
            } remaining.`
          );

          // Clear the MFA code field for retry
          setFormData((prev) => ({ ...prev, mfaCode: "" }));
        }
      }
    } catch (error) {
      console.error("❌ MFA request error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Get Secure Word"}
            </button>
          </form>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-green-800">
                Your Secure Word
              </h3>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {formData.secureWord}
              </p>
              <p className="text-sm text-green-700 mt-2">
                This word will expire in {secureWordTimer} seconds
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800">
                ⚠️ Remember this secure word. You'll need it in the next step.
              </p>
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next: Enter Password
            </button>
          </div>
        );

      case 3:
        return (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>
                Your secure word:{" "}
                <span className="font-medium">{formData.secureWord}</span>
              </p>
              <p>Time remaining: {secureWordTimer}s</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Login"}
            </button>
          </form>
        );

      case 4:
        return (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="mfaCode"
                className="block text-sm font-medium text-gray-700"
              >
                MFA Code
              </label>
              <input
                type="text"
                id="mfaCode"
                value={formData.mfaCode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mfaCode: e.target.value }))
                }
                className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                disabled={loading || isLocked}
              />
            </div>

            {/* Lockout Warning */}
            {isLocked && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">
                  🔒 Account temporarily locked due to failed attempts.
                  <br />
                  Time remaining:{" "}
                  {Math.ceil((lockoutEndTime - Date.now()) / 1000)} seconds
                </p>
              </div>
            )}

            {/* Attempt Counter */}
            {!isLocked && mfaAttempts > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <p className="text-orange-800 text-sm">
                  ⚠️ Failed attempts: {mfaAttempts}/3
                  <br />
                  Remaining attempts: {3 - mfaAttempts}
                </p>
              </div>
            )}

            {/* Demo MFA Code Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800 text-sm">
                📱 Enter the 6-digit code from your authenticator app.
              </p>
              {currentMfaCode && !isLocked && (
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                  <p className="text-yellow-800 text-xs">
                    <strong>Demo MFA Code:</strong> {currentMfaCode}
                    <br />
                    <span className="text-xs">
                      (In production, this would come from your authenticator
                      app)
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        mfaCode: currentMfaCode,
                      }))
                    }
                    className="mt-1 text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded"
                    disabled={isLocked}
                  >
                    Use this code
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={fetchMfaCode}
                className="mt-2 text-xs bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded"
                disabled={loading || isLocked}
              >
                Get new MFA code
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : isLocked ? "Locked" : "Verify MFA"}
            </button>

            {/* Reset Button for Testing */}
            {(isLocked || mfaAttempts > 0) && (
              <button
                type="button"
                onClick={resetToInitialState}
                className="w-full mt-2 text-center text-sm text-red-600 hover:text-red-500"
              >
                🔄 Reset (for testing)
              </button>
            )}
          </form>
        );

      default:
        return null;
    }
  };

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Step {step} of 4
            </p>
          </div>

          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {renderStep()}

            {step > 1 && !isLocked && (
              <button
                onClick={() => {
                  setStep(step - 1);
                  setError("");
                }}
                className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-500"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
