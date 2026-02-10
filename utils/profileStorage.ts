/**
 * Profile overlay storage: display name and profile photo URI.
 * Persists across app/web so edit profile reflects on home header.
 * Uses AsyncStorage (works on native and web).
 * In-memory cache ensures home tab sees the latest overlay immediately after profile save (web).
 */

const KEY_DISPLAY_NAME = '@mathbridge_profile_displayName';
const KEY_PHOTO_URI = '@mathbridge_profile_photoUri';

export type ProfileOverlay = {
  displayName?: string;
  photoUri?: string; // data URL (base64) or file URI for persistence
};

let AsyncStorage: typeof import('@react-native-async-storage/async-storage').default | null = null;

/** In-memory cache so home tab sees just-saved overlay without waiting for storage read */
let lastOverlay: ProfileOverlay = {};

async function getStorage() {
  if (AsyncStorage) return AsyncStorage;
  try {
    AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return AsyncStorage;
  } catch {
    return null;
  }
}

export async function getProfileOverlay(): Promise<ProfileOverlay> {
  const s = await getStorage();
  let fromStorage: ProfileOverlay = {};
  if (s) {
    try {
      const [name, photo] = await Promise.all([s.getItem(KEY_DISPLAY_NAME), s.getItem(KEY_PHOTO_URI)]);
      fromStorage = {
        displayName: name && name.length > 0 ? name : undefined,
        photoUri: photo && photo.length > 0 ? photo : undefined,
      };
    } catch {
      // ignore
    }
  }
  // Merge with in-memory cache so home header updates immediately after profile save (e.g. on web)
  return {
    displayName: lastOverlay.displayName !== undefined ? lastOverlay.displayName : fromStorage.displayName,
    photoUri: lastOverlay.photoUri !== undefined ? lastOverlay.photoUri : fromStorage.photoUri,
  };
}

/** Event name for notifying that overlay was updated (e.g. so home header can refresh) */
export const PROFILE_OVERLAY_UPDATED = 'profileOverlayUpdated';

export async function setProfileOverlay(overlay: ProfileOverlay): Promise<void> {
  if (overlay.displayName !== undefined) lastOverlay.displayName = overlay.displayName;
  if (overlay.photoUri !== undefined) lastOverlay.photoUri = overlay.photoUri;
  const s = await getStorage();
  if (!s) return;
  try {
    if (overlay.displayName !== undefined) await s.setItem(KEY_DISPLAY_NAME, overlay.displayName);
    if (overlay.photoUri !== undefined) await s.setItem(KEY_PHOTO_URI, overlay.photoUri);
  } catch (e) {
    console.warn('setProfileOverlay failed:', e);
  }
  // Notify listeners (e.g. home tab) so header updates without relying on focus
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(PROFILE_OVERLAY_UPDATED, { detail: { ...lastOverlay } }));
    } catch {
      // ignore
    }
  }
}

export async function clearProfileOverlay(): Promise<void> {
  lastOverlay = {};
  const s = await getStorage();
  if (!s) return;
  try {
    await Promise.all([s.removeItem(KEY_DISPLAY_NAME), s.removeItem(KEY_PHOTO_URI)]);
  } catch {
    // ignore
  }
}
