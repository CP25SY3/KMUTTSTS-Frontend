"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { msalInstance } from "@/lib/msalConfig";
import { setMsalToken, setMsalUser } from "@/api/features/auth/authApi";

export default function MicrosoftCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirectCallback = async () => {
      try {
        // Initialize MSAL
        await msalInstance.initialize();

        // Handle the redirect response
        const response = await msalInstance.handleRedirectPromise();

        if (response) {
          // Store tokens and user info
          if (response.accessToken) {
            setMsalToken(response.accessToken);
          }

          if (response.account) {
            setMsalUser({
              username: response.account.username,
              name: response.account.name || "",
              localAccountId: response.account.localAccountId,
              idToken: response.idToken,
            });
          }

          // Redirect to home page immediately
          window.location.href = "/";
        } else {
          // No response means this wasn't a redirect callback
          // Redirect immediately without showing anything
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Error handling redirect:", err);
        // On error, redirect to login
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    };

    handleRedirectCallback();
  }, [router]);

  // Return null immediately - no UI rendering at all
  return null;
}
