"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Search, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Math.floor(Date.now() / 1000);

          if (payload.exp > currentTime) {
            setIsAuthenticated(true);
            setUsername(payload.username);
          } else {
            localStorage.removeItem("authToken");
            setIsAuthenticated(false);
          }
        } catch (error) {
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();

    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUsername("");
    router.push("/");
    setIsOpen(false);
  };

  // Don't show navbar on dashboard (it has its own header)
  if (pathname === "/dashboard") {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-blue-600">
              AEON
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2"
              >
                Showcase
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2"
              >
                Docs
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2"
              >
                Blog
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2"
              >
                Analytics
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2"
              >
                Templates
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2"
              >
                Enterprise
              </Link>
            </div>
          </div>

          {/* Desktop Search and Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documentation..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 text-sm">{username}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden" data-testid="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <Link
              href="#"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Showcase
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Docs
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Analytics
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Commerce
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Templates
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Enterprise
            </Link>

            {/* Mobile Auth Section */}
            <div className="px-3 py-2 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 text-sm">{username}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors block text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-lg border border-red-200 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors block text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
