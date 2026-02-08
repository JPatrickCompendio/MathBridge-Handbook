/**
 * Cloudinary unsigned upload for profile pictures (web only).
 * Cloud name: dfiiso9ad
 * Upload preset: mathbridge_unsigned
 */

const CLOUDINARY_CLOUD_NAME = 'dfiiso9ad';
const CLOUDINARY_UPLOAD_PRESET = 'mathbridge_unsigned';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export type CloudinaryUploadResult = { secure_url: string; public_id: string };

/**
 * Convert a data URL (e.g. from image picker) to a Blob.
 */
function dataURLToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8 = new Uint8Array(n);
  for (let i = 0; i < n; i++) u8[i] = bstr.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

/**
 * Upload an image to Cloudinary (unsigned). For web only.
 * @param fileOrDataUrl - Either a data URL string (e.g. "data:image/jpeg;base64,...") or a File object
 * @returns The Cloudinary secure_url (and public_id) on success
 */
export async function uploadImageToCloudinary(
  fileOrDataUrl: string | File
): Promise<CloudinaryUploadResult> {
  let file: File | Blob;
  if (typeof fileOrDataUrl === 'string') {
    if (!fileOrDataUrl.startsWith('data:')) {
      throw new Error('Invalid data URL');
    }
    const blob = dataURLToBlob(fileOrDataUrl);
    const ext = fileOrDataUrl.includes('png') ? 'png' : 'jpeg';
    file = new File([blob], `profile.${ext}`, { type: blob.type });
  } else {
    file = fileOrDataUrl;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${errText}`);
  }

  const data = (await res.json()) as { secure_url?: string; public_id?: string };
  if (!data.secure_url) {
    throw new Error('Cloudinary did not return a URL');
  }
  return {
    secure_url: data.secure_url,
    public_id: data.public_id ?? '',
  };
}
