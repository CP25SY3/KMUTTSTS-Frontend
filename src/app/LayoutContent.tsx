"use client";

import { usePathname } from "next/navigation";
import SearchBar from "@/components/shared/SearchBar";
import Sidebar from "@/components/shared/Sidebar";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
      <div className="mx-auto flex ml-[6rem] gap-4 px-4 py-4">
        {/* Sidebar */}
        <Sidebar />
        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <SearchBar />
          {children}
        </div>
      </div>
    </div>
  );
}
