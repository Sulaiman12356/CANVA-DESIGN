// Safe localStorage utilities that gracefully handle QuotaExceededError and private browsing restrictions

export const safeGetItem = (key: string, fallback: string | null = null): string | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    return localStorage.getItem(key) ?? fallback;
  } catch (err) {
    console.warn(`[Storage] Failed to read "${key}" from localStorage:`, err);
    return fallback;
  }
};

export const safeSetItem = (key: string, value: string): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[Storage] Quota exceeded or error saving "${key}" to localStorage:`, err);
    // If quota is exceeded, try to clean up non-essential keys
    try {
      // Clean up potentially large legacy photo or registrations if needed
      if (key !== 'cda_mentor_photo') {
        localStorage.removeItem('cda_mentor_photo');
      }
    } catch {
      // Ignore
    }
    return false;
  }
};

export const safeRemoveItem = (key: string): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Storage] Failed to remove "${key}" from localStorage:`, err);
  }
};

export const safeGetSessionItem = (key: string, fallback: string | null = null): string | null => {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return fallback;
    return sessionStorage.getItem(key) ?? fallback;
  } catch (err) {
    return fallback;
  }
};

export const safeSetSessionItem = (key: string, value: string): boolean => {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return false;
    sessionStorage.setItem(key, value);
    return true;
  } catch (err) {
    return false;
  }
};

export const safeRemoveSessionItem = (key: string): void => {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    sessionStorage.removeItem(key);
  } catch (err) {
    // Ignore
  }
};

/**
 * Resizes and compresses an uploaded image file on the client before converting to Base64.
 * Keeps payload small (~30KB-80KB) to prevent QuotaExceededError.
 */
export const compressImageFile = (
  file: File,
  maxDimension = 600,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to raw result if canvas is unsupported
            resolve(e.target?.result as string);
            return;
          }

          // Draw and export compressed JPEG
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas compression error, using raw base64:', err);
          resolve(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
