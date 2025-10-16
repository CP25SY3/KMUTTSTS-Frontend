export function toImageSrc(url: string) {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined);
    const sameOrigin =
      typeof window !== 'undefined' && u.origin === window.location.origin;
    return sameOrigin ? u.pathname + u.search + u.hash : u.toString();
  } catch {
    return url; // already relative
  }
}