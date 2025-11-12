import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro - 375x812)
const baseWidth = 375;
const baseHeight = 812;

// Scale factor based on screen width
const scale = SCREEN_WIDTH / baseWidth;
const scaleHeight = SCREEN_HEIGHT / baseHeight;

// Responsive width percentage
export const wp = (percentage: number) => {
  return (percentage / 100) * SCREEN_WIDTH;
};

// Responsive height percentage
export const hp = (percentage: number) => {
  return (percentage / 100) * SCREEN_HEIGHT;
};

// Scale font size based on screen width
export const scaleFont = (size: number) => {
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

// Scale size based on screen width (for padding, margins, etc.)
export const scaleSize = (size: number) => {
  return Math.round(size * scale);
};

// Get responsive font size based on screen size
export const getFontSize = (small: number, medium: number, large: number) => {
  if (SCREEN_WIDTH < 375) {
    return small;
  } else if (SCREEN_WIDTH < 414) {
    return medium;
  } else {
    return large;
  }
};

// Check if device is tablet
export const isTablet = () => {
  return SCREEN_WIDTH >= 768;
};

// Check if device is small phone
export const isSmallDevice = () => {
  return SCREEN_WIDTH < 375;
};

// Check if device is large phone
export const isLargeDevice = () => {
  return SCREEN_WIDTH >= 414;
};

// Get responsive spacing
export const getSpacing = (base: number) => {
  if (isTablet()) {
    return base * 1.5;
  } else if (isSmallDevice()) {
    return base * 0.85;
  }
  return base;
};

// Get number of columns for grid based on screen size
export const getColumns = (preferredColumns: number = 2) => {
  if (isTablet()) {
    return preferredColumns + 1;
  } else if (isSmallDevice()) {
    return Math.max(1, preferredColumns - 1);
  }
  return preferredColumns;
};

// Get card width for grid layouts
export const getCardWidth = (columns: number, spacing: number = 16) => {
  const totalSpacing = spacing * (columns + 1);
  return (SCREEN_WIDTH - totalSpacing) / columns;
};

// Get status bar height for safe area padding
export const getStatusBarHeight = () => {
  if (Platform.OS === 'android') {
    // Android status bar height (typically 24-48px depending on device)
    // Fallback to a safe default if StatusBar.currentHeight is not available
    return StatusBar.currentHeight || 24;
  }
  // iOS - SafeAreaView handles status bar, but we add small padding for notch/notch-like areas
  // For devices with notches, we might need ~44px, but SafeAreaView should handle it
  // We'll add a small buffer for consistency
  return 0;
};

// Get safe area top padding (status bar + additional spacing)
export const getSafeAreaTopPadding = () => {
  const statusBarHeight = getStatusBarHeight();
  // Add extra padding for better spacing (prevents overlap with status bar content)
  // This is especially important on Android where SafeAreaView doesn't automatically handle status bar
  const extraPadding = isSmallDevice() ? 12 : isTablet() ? 16 : 14;
  return statusBarHeight + extraPadding;
};

// Screen dimensions
export const SCREEN_DIMENSIONS = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scale,
  scaleHeight,
  isTablet: isTablet(),
  isSmallDevice: isSmallDevice(),
  isLargeDevice: isLargeDevice(),
};

