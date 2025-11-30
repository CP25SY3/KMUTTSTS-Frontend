"use client";

import { useEffect, useState } from "react";

export default function MsalDebugPage() {
  const [config, setConfig] = useState({
    clientId: "",
    tenantId: "",
    redirectUri: "",
    origin: "",
  });

  useEffect(() => {
    setConfig({
      clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "NOT SET",
      tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID || "NOT SET",
      redirectUri: window.location.origin + "/auth/microsoft/callback",
      origin: window.location.origin,
    });
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">MSAL Configuration Debug</h1>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Current Configuration</h2>

          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="font-semibold min-w-[200px]">Client ID:</span>
              <code className="bg-muted px-2 py-1 rounded">
                {config.clientId}
              </code>
            </div>

            <div className="flex gap-2">
              <span className="font-semibold min-w-[200px]">Tenant ID:</span>
              <code className="bg-muted px-2 py-1 rounded">
                {config.tenantId}
              </code>
            </div>

            <div className="flex gap-2">
              <span className="font-semibold min-w-[200px]">
                Current Origin:
              </span>
              <code className="bg-muted px-2 py-1 rounded">
                {config.origin}
              </code>
            </div>

            <div className="flex gap-2 items-start">
              <span className="font-semibold min-w-[200px]">Redirect URI:</span>
              <div className="flex-1">
                <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded block">
                  {config.redirectUri}
                </code>
                <p className="text-sm text-muted-foreground mt-2">
                  👆 This is the exact URI you need to add in Azure Portal
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
            📋 Setup Instructions
          </h2>

          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li className="space-y-2">
              <span className="font-semibold">Go to Azure Portal:</span>
              <a
                href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Authentication/appId/66adeccf-e803-4008-a974-91180f8690a1"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 dark:text-blue-400 hover:underline ml-6"
              >
                → Click here to go directly to your app&apos;s Authentication
                page
              </a>
            </li>

            <li className="space-y-2">
              <span className="font-semibold">
                Add Platform (if not already added):
              </span>
              <ul className="list-disc list-inside ml-6 space-y-1 text-muted-foreground">
                <li>Click &quot;Add a platform&quot;</li>
                <li>
                  Select <strong>&quot;Single-page application&quot;</strong>{" "}
                  (NOT &quot;Web&quot;)
                </li>
              </ul>
            </li>

            <li className="space-y-2">
              <span className="font-semibold">Add Redirect URI:</span>
              <div className="ml-6 space-y-2">
                <p className="text-muted-foreground">
                  Copy and paste this exact URI:
                </p>
                <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                  <code className="text-green-600 dark:text-green-400 font-mono">
                    {config.redirectUri}
                  </code>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(config.redirectUri)
                    }
                    className="ml-4 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </li>

            <li className="space-y-2">
              <span className="font-semibold">Save the changes</span>
            </li>

            <li className="space-y-2">
              <span className="font-semibold">Test the login:</span>
              <a
                href="/login"
                className="block text-blue-600 dark:text-blue-400 hover:underline ml-6"
              >
                → Go to Login Page
              </a>
            </li>
          </ol>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 space-y-2">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100">
            ⚠️ Important Notes:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-amber-800 dark:text-amber-200">
            <li>
              Must use <strong>Single-page application (SPA)</strong> platform
              type
            </li>
            <li>
              The redirect URI must match exactly (including http:// and port)
            </li>
            <li>No trailing slash at the end</li>
            <li>Changes in Azure Portal may take a few moments to propagate</li>
          </ul>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            Alternative: Use Different Port
          </h2>
          <p className="text-sm text-muted-foreground">
            If you already have redirect URIs configured for a different port in
            Azure, you can start your dev server on that port:
          </p>
          <div className="bg-muted p-3 rounded">
            <code className="text-sm">npm run dev -- -p PORT_NUMBER</code>
          </div>
          <p className="text-xs text-muted-foreground">
            Replace PORT_NUMBER with the port configured in your Azure redirect
            URIs
          </p>
        </div>
      </div>
    </div>
  );
}
