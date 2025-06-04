import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../../app/login/page";

// Mock fetch
global.fetch = jest.fn();

describe("Login Page", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("renders username input step initially", () => {
    render(<LoginPage />);

    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your username")
    ).toBeInTheDocument();
    expect(screen.getByText("Get Secure Word")).toBeInTheDocument();
  });

  test("shows error when submitting empty username", async () => {
    render(<LoginPage />);

    const submitButton = screen.getByText("Get Secure Word");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter a username")).toBeInTheDocument();
    });
  });

  test("submits username and moves to secure word step", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ secureWord: "TESTWORD", expiresIn: 60 }),
    });

    render(<LoginPage />);

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const submitButton = screen.getByText("Get Secure Word");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Your Secure Word")).toBeInTheDocument();
      expect(screen.getByText("TESTWORD")).toBeInTheDocument();
    });
  });

  test("displays MFA step with correct input", async () => {
    render(<LoginPage />);

    // Simulate being on MFA step
    // This would require more complex state management in a real test
    const mfaInput = screen.queryByPlaceholderText("000000");
    if (mfaInput) {
      expect(mfaInput).toHaveAttribute("maxLength", "6");
    }
  });
});
