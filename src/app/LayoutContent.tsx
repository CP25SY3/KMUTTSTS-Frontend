"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import SearchBar from "@/components/shared/SearchBar";
import Sidebar from "@/components/shared/Sidebar";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide sidebar and searchbar on auth pages (login, signup, etc.)
  const isAuthPage =
    pathname?.startsWith("/login") || pathname?.startsWith("/auth");

  if (isAuthPage) {
    // Render without sidebar and searchbar
    return <>{children}</>;
  }

  // Render with sidebar and searchbar
  return (
    <div className="min-h-screen">
      {/* Mobile: Sidebar as overlay */}
      <div className="lg:hidden">
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Sidebar */}
            <div className="fixed left-0 top-0 z-50">
              <Sidebar position="fixed" />
            </div>
          </>
        )}
      </div>

      {/* Desktop: Normal layout with fixed sidebar */}
      <div className="mx-auto flex lg:ml-[6rem] gap-4 px-2 sm:px-4 py-2 sm:py-4">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full lg:w-auto">
          {/* Top Bar */}
          <SearchBar onMenuClick={() => setIsMobileMenuOpen(true)} />
          {children}
        </div>
      </div>
    </div>
  );
}
