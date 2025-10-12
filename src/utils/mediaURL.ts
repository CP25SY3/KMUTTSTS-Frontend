const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

/** Convert relative Strapi file URL to absolute */
export function mediaURL(path?: string) {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${BASE}${path}`;
}