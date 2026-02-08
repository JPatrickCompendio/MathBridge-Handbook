/**
 * Profile overlay storage: display name and profile photo URI.
 * Persists across app/web so edit profile reflects on home header.
 * Uses AsyncStorage (works on native and web).
 */

const KEY_DISPLAY_NAME = '@mathbridge_profile_displayName';
const KEY_PHOTO_URI = '@mathbridge_profile_photoUri';

export type ProfileOverlay = {
  displayName?: string;
  photoUri?: string; // data URL (base64) or file URI for persistence
};

let AsyncStorage: typeof import('@react-native-async-storage/async-storage').default | null = null;

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
  if (!s) return {};
  try {
    const [name, photo] = await Promise.all([s.getItem(KEY_DISPLAY_NAME), s.getItem(KEY_PHOTO_URI)]);
    return {
      displayName: name && name.length > 0 ? name : undefined,
      photoUri: photo && photo.length > 0 ? photo : undefined,
    };
  } catch {
    return {};
  }
}

export async function setProfileOverlay(overlay: ProfileOverlay): Promise<void> {
  const s = await getStorage();
  if (!s) return;
  try {
    if (overlay.displayName !== undefined) await s.setItem(KEY_DISPLAY_NAME, overlay.displayName);
    if (overlay.photoUri !== undefined) await s.setItem(KEY_PHOTO_URI, overlay.photoUri);
  } catch (e) {
    console.warn('setProfileOverlay failed:', e);
  }
}

export async function clearProfileOverlay(): Promise<void> {
  const s = await getStorage();
  if (!s) return;
  try {
    await Promise.all([s.removeItem(KEY_DISPLAY_NAME), s.removeItem(KEY_PHOTO_URI)]);
  } catch {
    // ignore
  }
}
