import {
  Configuration,
  PublicClientApplication,
  LogLevel,
} from "@azure/msal-browser";

declare global {
  interface Window {
    _env_?: {
      NEXT_PUBLIC_AZURE_CLIENT_ID?: string;
      NEXT_PUBLIC_AZURE_TENANT_ID?: string;
      NEXT_PUBLIC_API_BASE_URL?: string;
      NEXT_IMAGE_UNOPTIMIZED?: string;
    };
  }
}

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId:
      (typeof window !== "undefined" &&
        window._env_?.NEXT_PUBLIC_AZURE_CLIENT_ID) ||
      process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ||
      "", // Your Azure AD Application (client) ID
    authority: `https://login.microsoftonline.com/${
      (typeof window !== "undefined" &&
        window._env_?.NEXT_PUBLIC_AZURE_TENANT_ID) ||
      process.env.NEXT_PUBLIC_AZURE_TENANT_ID ||
      "common"
    }`, // Your Azure AD tenant ID or "common"
    redirectUri:
      typeof window !== "undefined"
        ? window.location.origin + "/auth/microsoft/callback"
        : "", // Must match Azure AD app registration
    postLogoutRedirectUri:
      typeof window !== "undefined" ? window.location.origin : "",
  },
  cache: {
    cacheLocation: "localStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set to true for IE 11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

// Add scopes for the access token
export const loginRequest = {
  scopes: ["User.Read"], // Microsoft Graph scopes
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);
