import { useCallback } from "react";
// import { msalInstance, loginRequest } from "@/lib/msalConfig";
import { setMsalToken, setMsalUser } from "@/api/features/auth/authApi";
import { AuthenticationResult } from "@azure/msal-browser";

export function useMsalAuth() {
  const loginWithPopup = useCallback(async () => {
    try {
      // Mock MSAL instance initialization
      // await msalInstance.initialize();

      console.log("Mocking Microsoft Login...");

      // Mock successful response
      const mockResponse: Partial<AuthenticationResult> = {
        accessToken: "mock_access_token_" + Date.now(),
        idToken: "mock_id_token_" + Date.now(),
        account: {
          homeAccountId: "mock_home_account_id",
          environment: "mock_environment",
          tenantId: "mock_tenant_id",
          username: "mockuser@example.com",
          localAccountId: "mock_local_account_id",
          name: "Mock User",
          authorityType: "MSSTS",
        },
        uniqueId: "mock_unique_id",
        tenantId: "mock_tenant_id",
        scopes: ["User.Read"],
        fromCache: false,
        expiresOn: new Date(Date.now() + 3600 * 1000),
        tokenType: "Bearer",
        correlationId: "mock_correlation_id",
      };

      const response = mockResponse as AuthenticationResult;

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
      console.log("Mocking Microsoft Login Redirect... (doing nothing)");
      // Initialize MSAL instance
      // await msalInstance.initialize();

      // Login with redirect
      // await msalInstance.loginRedirect(loginRequest);
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
