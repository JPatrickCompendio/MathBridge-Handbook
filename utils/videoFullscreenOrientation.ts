/**
 * App-only: lock orientation to landscape when video goes fullscreen,
 * and back to portrait when fullscreen is dismissed.
 * No-op on web.
 */

import { VideoFullscreenUpdate, VideoFullscreenUpdateEvent } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback } from 'react';
import { Platform } from 'react-native';

/**
 * Safely lock orientation when the Expo AV video enters/exits fullscreen.
 * Any errors from the native orientation API are caught so they do NOT crash the app.
 */
export function useVideoFullscreenOrientationHandler(): (event: VideoFullscreenUpdateEvent) => void {
  const safeLock = useCallback(async (lock: ScreenOrientation.OrientationLock) => {
    try {
      await ScreenOrientation.lockAsync(lock);
    } catch (e) {
      // Swallow orientation errors to avoid app crashes; log for debugging only.
      console.warn('ScreenOrientation.lockAsync failed', e);
    }
  }, []);

  return useCallback(
    (event: VideoFullscreenUpdateEvent) => {
      if (Platform.OS === 'web') return;
      const { fullscreenUpdate } = event;

      if (fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_PRESENT) {
        void safeLock(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else if (fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
        void safeLock(ScreenOrientation.OrientationLock.PORTRAIT);
      }
    },
    [safeLock]
  );
}
