import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../../app/components/Navbar";

// Mock Next.js hooks
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => "/",
}));

describe("Navbar Component", () => {
  // Set mobile viewport for consistent testing
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375, // Mobile width
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 667,
    });
  });

  test("renders navbar with title", () => {
    render(<Navbar />);
    expect(screen.getByText("AEON")).toBeInTheDocument();
  });

  test("toggles mobile menu when hamburger is clicked", () => {
    render(<Navbar />);

    // Initially, mobile menu should not be present in DOM
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();

    // Click hamburger menu
    const hamburgerButton = screen.getByRole("button");
    fireEvent.click(hamburgerButton);

    // Mobile menu should now be present
    expect(screen.queryByTestId("mobile-menu")).toBeInTheDocument();

    // Check for mobile-specific showcase link
    const mobileShowcaseLinks = screen.getAllByText("Showcase");
    expect(mobileShowcaseLinks.length).toBeGreaterThan(1); // Both desktop (hidden) and mobile versions
  });

  test("displays login button", () => {
    render(<Navbar />);
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("mobile menu is hidden initially and shows after click", () => {
    render(<Navbar />);

    // The mobile menu container should not exist initially
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();

    // Click to open
    const hamburgerButton = screen.getByRole("button");
    fireEvent.click(hamburgerButton);

    // Now it should exist
    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();

    // Click to close
    fireEvent.click(hamburgerButton);

    // Should be gone again
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
  });
});
