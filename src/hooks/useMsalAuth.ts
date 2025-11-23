import { useCallback } from "react";
import { msalInstance, loginRequest } from "@/lib/msalConfig";
import { setMsalToken, setMsalUser } from "@/api/features/auth/authApi";
import { AuthenticationResult } from "@azure/msal-browser";

export function useMsalAuth() {
  const loginWithPopup = useCallback(async () => {
    try {
      // Initialize MSAL instance
      await msalInstance.initialize();

      // Login with popup
      const response: AuthenticationResult = await msalInstance.loginPopup(
        loginRequest
      );

      // Store tokens and user info in localStorage
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

      return response;
    } catch (error) {
      console.error("Microsoft login failed:", error);
      throw error;
    }
  }, []);

  const loginWithRedirect = useCallback(async () => {
    try {
      // Initialize MSAL instance
      await msalInstance.initialize();

      // Login with redirect
      await msalInstance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Microsoft login redirect failed:", error);
      throw error;
    }
  }, []);

  return {
    loginWithPopup,
    loginWithRedirect,
  };
}
