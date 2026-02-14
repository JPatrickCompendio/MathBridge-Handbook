/**
 * Lesson video player using expo-video (replaces deprecated expo-av Video).
 * Supports both local assets (native) and remote URIs (web).
 * Pauses when screen loses focus to reduce memory use and avoid native crashes on Android.
 * On web: custom control bar (play/pause, skip, progress, fullscreen) to match app experience.
 */

import { useEvent } from 'expo';
import { useFocusEffect } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Text,
  View,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { scaleFont } from '../utils/responsive';
import { getVideoSource } from '../utils/videoCatalog';
import type { VideoId } from '../utils/videoCatalog';

type ContentFit = 'contain' | 'cover' | 'fill';

export type LessonVideoProps = {
  videoId: VideoId;
  style?: StyleProp<ViewStyle>;
  contentFit?: ContentFit;
  /** Thumbnail label shown before first frame (e.g. topic or method name) */
  thumbnailLabel?: string;
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
  videoWrapper: {
    overflow: 'hidden',
    position: 'relative',
  },
  videoWrapperWeb: {
    overflow: 'visible',
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 200,
  },
  videoWeb: {
    width: '100%',
    height: '100%',
    minHeight: 200,
  },
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
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  thumbnailLabel: {
    color: '#94A3B8',
    fontSize: scaleFont(16),
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  maximizeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  maximizeButtonText: {
    color: '#fff',
    fontSize: scaleFont(13),
    fontWeight: '600',
  },
  // Web custom controls (match app version)
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 16,
  },
  controlButton: {
    padding: 8,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: scaleFont(14),
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  timeText: {
    color: '#fff',
    fontSize: scaleFont(12),
    minWidth: 45,
    textAlign: 'right',
  },
  fullscreenBtn: {
    padding: 4,
    marginLeft: 8,
  },
});

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function LessonVideo({ videoId, style, contentFit, thumbnailLabel }: LessonVideoProps) {
  const [showThumbnail, setShowThumbnail] = useState(!!thumbnailLabel);
  const [currentTime, setCurrentTime] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const videoViewRef = useRef<{ enterFullscreen?: () => Promise<void> } | null>(null);
  const source = normalizeSource(videoId);
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.muted = false;
    if (Platform.OS === 'web') {
      p.timeUpdateEventInterval = 0.5;
    }
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { currentTime: timeFromEvent } = useEvent(player, 'timeUpdate', { currentTime: player.currentTime });

  useEffect(() => {
    if (Platform.OS === 'web' && Number.isFinite(timeFromEvent)) {
      setCurrentTime(timeFromEvent);
    }
  }, [timeFromEvent, Platform.OS]);

  useEffect(() => {
    if (thumbnailLabel && isPlaying) {
      setShowThumbnail(false);
    }
  }, [thumbnailLabel, isPlaying]);

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

  const handleMaximize = useCallback(() => {
    videoViewRef.current?.enterFullscreen?.();
  }, []);

  const duration = player.duration;
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  const handleProgressPress = useCallback(
    (e: { nativeEvent: { locationX: number } }) => {
      if (progressBarWidth <= 0 || duration <= 0) return;
      const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / progressBarWidth));
      player.currentTime = ratio * duration;
      setCurrentTime(ratio * duration);
    },
    [progressBarWidth, duration, player]
  );

  const videoWrapperStyle = Platform.OS === 'web'
    ? [styles.videoWrapperWeb, style]
    : [styles.videoWrapper, style];
  const videoStyle = Platform.OS === 'web'
    ? styles.videoWeb
    : StyleSheet.absoluteFill;

  return (
    <VideoErrorBoundary style={style}>
      <View style={videoWrapperStyle}>
        <VideoView
          ref={videoViewRef as any}
          player={player}
          style={videoStyle}
          contentFit={fit}
          nativeControls={Platform.OS !== 'web'}
          allowsPictureInPicture={Platform.OS === 'web'}
          playsInline={Platform.OS === 'web'}
          {...fullscreenProps}
        />
        {Platform.OS === 'web' && (
          <>
            <View style={styles.controlsOverlay}>
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => { player.currentTime = 0; setCurrentTime(0); }}
                  accessibilityLabel="Restart"
                >
                  <Text style={styles.controlButtonText}>⏮</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => player.seekBy(-5)}
                  accessibilityLabel="Rewind 5 seconds"
                >
                  <Text style={styles.controlButtonText}>5 ⏪</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => (isPlaying ? player.pause() : player.play())}
                  accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
                >
                  <Text style={[styles.controlButtonText, { fontSize: scaleFont(18) }]}>
                    {isPlaying ? '⏸' : '▶'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => player.seekBy(15)}
                  accessibilityLabel="Forward 15 seconds"
                >
                  <Text style={styles.controlButtonText}>15 ⏩</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => { player.currentTime = duration; setCurrentTime(duration); }}
                  accessibilityLabel="Skip to end"
                >
                  <Text style={styles.controlButtonText}>⏭</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Pressable
                  style={styles.progressBar}
                  onPress={handleProgressPress}
                  onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
                >
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </Pressable>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
                <TouchableOpacity
                  style={styles.fullscreenBtn}
                  onPress={handleMaximize}
                  accessibilityLabel="Maximize"
                >
                  <Text style={styles.controlButtonText}>⛶</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        {thumbnailLabel && showThumbnail && (
          <View style={styles.thumbnailOverlay} pointerEvents="none">
            <Text style={styles.thumbnailLabel}>{thumbnailLabel}</Text>
          </View>
        )}
      </View>
    </VideoErrorBoundary>
  );
}
