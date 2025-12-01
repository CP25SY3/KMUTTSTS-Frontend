const BASE: string =
  (typeof window !== "undefined" && window._env_?.NEXT_PUBLIC_API_BASE_URL) ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "";

/** แปลง relative Strapi file URL เป็น absolute URL */
export function mediaURL(path?: string | ""): string {
  // ตรวจสอบว่า path เป็น string ที่มีค่าหรือไม่
  if (!path || typeof path !== "string") {
    return "";
  }

  // ตรวจสอบว่า path เป็น string ว่างหรือไม่
  if (path.trim() === "") {
    return "";
  }

  // ถ้า path เป็น absolute URL อยู่แล้ว ให้ return path
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const baseWithPath = `${BASE}${path}`;

  // รวม BASE URL กับ path
  return baseWithPath;
}
