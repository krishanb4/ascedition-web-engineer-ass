"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide navbar on dashboard pages
  const hiddenRoutes = ["/dashboard"];
  const shouldHideNavbar = hiddenRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (shouldHideNavbar) {
    return null;
  }

  return <Navbar />;
}
