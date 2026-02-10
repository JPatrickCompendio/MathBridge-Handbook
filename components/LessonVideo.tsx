/**
 * Lesson video player using expo-video (replaces deprecated expo-av Video).
 * Supports both local assets (native) and remote URIs (web).
 * Pauses when screen loses focus to reduce memory use and avoid native crashes on Android.
 */

import { useFocusEffect } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback } from 'react';
import { Platform, StyleSheet, StyleProp, ViewStyle, Text, View } from 'react-native';
import { getVideoSource } from '../utils/videoCatalog';
import type { VideoId } from '../utils/videoCatalog';

type ContentFit = 'contain' | 'cover' | 'fill';

export type LessonVideoProps = {
  videoId: VideoId;
  style?: StyleProp<ViewStyle>;
  contentFit?: ContentFit;
};

function normalizeSource(videoId: VideoId): string | number {
  const raw = getVideoSource(videoId);
  if (typeof raw === 'number') return raw;
  return (raw as { uri: string }).uri;
}

/** Catches video render errors so one bad video doesn't crash the app */
class VideoErrorBoundary extends React.Component<
  { children: React.ReactNode; style?: StyleProp<ViewStyle> },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    console.warn('LessonVideo error boundary caught:', err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.fallback, this.props.style]}>
          <Text style={styles.fallbackText}>Video unavailable</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  fallbackText: {
    color: '#999',
    fontSize: 14,
  },
});

export function LessonVideo({ videoId, style, contentFit }: LessonVideoProps) {
  const source = normalizeSource(videoId);
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.muted = false;
  });

  useFocusEffect(
    useCallback(() => {
      return () => {
        try {
          player.pause();
        } catch (_e) {
          // ignore if player already released
        }
      };
    }, [player])
  );

  const fit: ContentFit =
    contentFit ?? (Platform.OS === 'web' ? 'contain' : 'cover');

  // Web implementation still uses allowsFullscreen for the fullscreen button and enterFullscreen;
  // fullscreenOptions is used on native. Pass both so fullscreen works on all platforms.
  const fullscreenProps =
    Platform.OS === 'web'
      ? { allowsFullscreen: true as const }
      : { fullscreenOptions: { enable: true } as const };

  return (
    <VideoErrorBoundary style={style}>
      <VideoView
        player={player}
        style={style}
        contentFit={fit}
        nativeControls
        {...fullscreenProps}
      />
    </VideoErrorBoundary>
  );
}
