/**
 * App-only: lock orientation to landscape when video goes fullscreen,
 * and back to portrait when fullscreen is dismissed.
 * No-op on web.
 */

import { VideoFullscreenUpdate, VideoFullscreenUpdateEvent } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback } from 'react';
import { Platform } from 'react-native';

export function useVideoFullscreenOrientationHandler(): (event: VideoFullscreenUpdateEvent) => void {
  return useCallback((event: VideoFullscreenUpdateEvent) => {
    if (Platform.OS === 'web') return;
    const { fullscreenUpdate } = event;
    if (fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_PRESENT) {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else if (fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }, []);
}
