"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { ModeToggle } from "@/components/ui/ThemeToggle";
import { useLogin } from "@/api/features/auth/authHooks";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { useMsalAuth } from "@/hooks/useMsalAuth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState<string>("");
  const [msalLoading, setMsalLoading] = useState(false);
  const login = useLogin();
  // const { loginWithPopup } = useMsalAuth();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setIdentifier(identifier.trim());
    setPassword(password.trim());
    login.mutate(
      { identifier, password },
      {
        onSuccess: () => {
          // navigate to main page on successful login
          router.push("/");
        },
        onError: (error) => {
          setErrorText(error.message);
        },
      }
    );
  };

  const handleMicrosoftLogin = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setErrorText("");
    setMsalLoading(true);

    try {
      // Use popup for better UX
      // await loginWithPopup();
      // Success - redirect to home page
      router.push("/");

      // For redirect flow (uncomment if preferred):
      // await loginWithRedirect();
      // Note: redirect flow will navigate away, so no need to set loading to false
    } catch (error) {
      console.error("Microsoft login error:", error);
      // Only show error if it's a real error, not user cancellation
      if (error instanceof Error) {
        // Check if user cancelled the popup
        if (
          error.message.includes("user_cancelled") ||
          error.message.includes("AADB2C90091")
        ) {
          // User cancelled, just reset loading state without error message
          setMsalLoading(false);
        } else {
          setErrorText("Failed to sign in with Microsoft. Please try again.");
          setMsalLoading(false);
        }
      } else {
        setErrorText("Failed to sign in with Microsoft. Please try again.");
        setMsalLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex flex-1 relative">
        <Image
          src="/login.png"
          alt="Login Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="p-4 absolute top-0 right-0 z-10">
        <ModeToggle />
      </div>
      <div className="flex flex-1 justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold text-center">
            Sign in to KMUTT Station
          </h1>

          <form className="space-y-3 sm:space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                id="email"
                type="text"
                placeholder="Username or Email"
                className="w-full px-4 py-3 rounded-lg focus:outline-none
                           border border-[var(--border)]
                           bg-[var(--background)] text-[var(--foreground)]
                           focus:ring-2 focus:ring-[var(--primary)]"
                required
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg focus:outline-none
                           border border-[var(--border)]
                           bg-[var(--background)] text-[var(--foreground)]
                           focus:ring-2 focus:ring-[var(--primary)]"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
              </button>
            </div>
            {errorText && (
              <p className="mt-1 text-sm text-red-600">{errorText}</p>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                Remember me
              </label>
              <Link
                href="#"
                className="hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Forgot Password?
              </Link>
            </div>

            <div>
              <Button
                type="submit"
                className="btn-primary w-full font-semibold py-6 rounded-lg"
                disabled={
                  login.isPending ||
                  identifier.length === 0 ||
                  password.length === 0
                }
              >
                Sign in
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-4">
            <hr className="flex-1 border-[var(--border)]" />
            <span className="text-sm text-[color:var(--foreground)]/60">
              Or login with
            </span>
            <hr className="flex-1 border-[var(--border)]" />
          </div>

          <div className="flex">
            <button
              type="button"
              onClick={handleMicrosoftLogin}
              disabled={msalLoading}
              aria-label="Sign in with Microsoft"
              className="flex-1 flex items-center justify-center gap-3 rounded-lg py-3 px-4 transition-colors duration-200
                         border border-[var(--border)]
                         bg-[var(--muted)] text-[var(--muted-text)]
                         hover:bg-[var(--primary)] hover:text-[var(--primary-text)]
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {msalLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  <span className="font-medium">Signing in...</span>
                </>
              ) : (
                <>
                  <Image
                    src="/microsoft_logo.png"
                    alt="Microsoft"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">Sign in with Microsoft</span>
                </>
              )}
            </button>
          </div>

          <p className="text-center text-sm">
            Don’t have an account?{" "}
            <Link
              href="#"
              className="hover:underline"
              style={{ color: "var(--primary)" }}
            >
              Sign Up now
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
