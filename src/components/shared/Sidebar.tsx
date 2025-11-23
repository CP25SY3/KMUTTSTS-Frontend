"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  TrendingUp,
  Clock,
  Download,
  Settings,
  LogOut,
} from "lucide-react";
import { useLogout } from "@/api/features/auth/authHooks";
import { msalInstance } from "@/lib/msalConfig";
import { getMsalToken } from "@/api/features/auth/authApi";

type Item = {
  icon: React.ReactNode;
  href: string;
  label: string;
  active?: boolean;
};

type SidebarProps = {
  position?: "sticky" | "fixed";
  leftOffset?: number;
  items?: Item[];
};

const DEFAULT_ITEMS: Item[] = [
  { icon: <Home size={20} />, href: "#", label: "Home", active: true },
  { icon: <TrendingUp size={20} />, href: "#", label: "Trending" },
  { icon: <Clock size={20} />, href: "#", label: "History" },
  { icon: <Download size={20} />, href: "#", label: "Downloads" },
  { icon: <Settings size={20} />, href: "#", label: "Settings" },
];

export default function Sidebar({
  position = "fixed",
  leftOffset = 0,
  items = DEFAULT_ITEMS,
}: SidebarProps) {
  const positionClass =
    position === "fixed" ? "fixed inset-y-0" : "sticky top-0";
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      // Check if user is logged in with MSAL
      const msalToken = getMsalToken();

      if (msalToken) {
        // Initialize MSAL instance
        await msalInstance.initialize();

        // Get all accounts
        const accounts = msalInstance.getAllAccounts();

        if (accounts.length > 0) {
          // Logout from MSAL
          await msalInstance.logoutPopup({
            account: accounts[0],
            postLogoutRedirectUri: window.location.origin,
          });
        }
      }

      // Clear local storage and query cache
      logout();

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local data and redirect even if MSAL logout fails
      logout();
      router.push("/login");
    }
  };

  return (
    <aside
      role="navigation"
      aria-label="Primary"
      className={`${positionClass} left-0 h-[calc(100vh-2rem)] w-[72px] shrink-0 m-4 rounded-2xl bg-background shadow-lg z-50`}
      style={position === "fixed" ? { left: leftOffset } : undefined}
    >
      <div className="flex h-full flex-col items-center gap-3 py-3">
        {/* Brand Button */}
        <button
          aria-label="Brand"
          className="mt-1 grid h-11 w-11 place-items-center rounded-full shadow outline-none bg-muted ring-0 focus-visible:ring-2 focus-visible:ring-[var(--border)]"
        >
          <span
            className="h-5 w-5 rounded-sm"
            style={{ background: "var(--primary)" }}
          />
        </button>

        {/* Menu */}
        <ul className="mt-2 flex flex-col items-center gap-2">
          {items.map((it) => (
            <li key={it.label}>
              <Link
                href={it.href}
                aria-current={it.active ? "page" : undefined}
                className={[
                  "grid h-11 w-11 place-items-center bg-pri rounded-xl transition-colors outline-none",
                  it.active
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-background hover:bg-muted",
                  "focus-visible:ring-2 focus-visible:ring-[var(--border)]",
                ].join(" ")}
                title={it.label}
              >
                {it.icon}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex-1" />

        {/* Logout Button */}
        <button
          aria-label="Logout"
          onClick={handleLogout}
          className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-background shadow transition-colors hover:bg-red-500 hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--border)]"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
