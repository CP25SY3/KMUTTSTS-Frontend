#!/bin/sh

# Recreate config file
rm -rf ./public/env-config.js
touch ./public/env-config.js

# Add assignment
echo "window._env_ = {" >> ./public/env-config.js

# Read environment variables and add them to the config file
# We check if the variables are set, if so we add them
if [ -n "$NEXT_PUBLIC_AZURE_CLIENT_ID" ]; then
  echo "  NEXT_PUBLIC_AZURE_CLIENT_ID: \"$NEXT_PUBLIC_AZURE_CLIENT_ID\"," >> ./public/env-config.js
fi

if [ -n "$NEXT_PUBLIC_AZURE_TENANT_ID" ]; then
  echo "  NEXT_PUBLIC_AZURE_TENANT_ID: \"$NEXT_PUBLIC_AZURE_TENANT_ID\"," >> ./public/env-config.js
fi

if [ -n "$NEXT_PUBLIC_API_BASE_URL" ]; then
  echo "  NEXT_PUBLIC_API_BASE_URL: \"$NEXT_PUBLIC_API_BASE_URL\"," >> ./public/env-config.js
fi

if [ -n "$NEXT_IMAGE_UNOPTIMIZED" ]; then
  echo "  NEXT_IMAGE_UNOPTIMIZED: \"$NEXT_IMAGE_UNOPTIMIZED\"," >> ./public/env-config.js
fi

echo "}" >> ./public/env-config.js

# Execute the command passed into this entrypoint
exec "$@"
