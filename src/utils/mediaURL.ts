const BASE: string = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/** แปลง relative Strapi file URL เป็น absolute URL */
export function mediaURL(path?: string | null | undefined): string | undefined {
  // ตรวจสอบว่า path เป็น string ที่มีค่าหรือไม่
  if (!path || typeof path !== 'string') {
    return undefined;
  }
  
  // ตรวจสอบว่า path เป็น string ว่างหรือไม่
  if (path.trim() === '') {
    return undefined;
  }
  
  // ถ้า path เป็น absolute URL อยู่แล้ว ให้ return path
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // รวม BASE URL กับ path
  return `${BASE}${path}`;
}