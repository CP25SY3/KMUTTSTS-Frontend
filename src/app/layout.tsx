import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SearchBar from "@/components/shared/SearchBar";
import Sidebar from "@/components/shared/Sidebar";
import { AppProviders } from "@/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KMUTT Station",
  description: "Create by CP25SY3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
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
        </AppProviders>
      </body>
    </html>
  );
}
