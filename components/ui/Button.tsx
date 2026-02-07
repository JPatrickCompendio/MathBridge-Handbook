import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: false,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      // Quick pulse animation on press
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: false,
          tension: 300,
          friction: 10,
        }),
      ]).start();
      onPress();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    if (size === 'small') {
      baseStyle.paddingVertical = Spacing.sm;
      baseStyle.paddingHorizontal = Spacing.md;
    } else if (size === 'medium') {
      baseStyle.paddingVertical = Spacing.md;
      baseStyle.paddingHorizontal = Spacing.lg;
    } else if (size === 'large') {
      baseStyle.paddingVertical = Spacing.md + 4;
      baseStyle.paddingHorizontal = Spacing.xl;
    }

    // Variant styles with enhanced shadows
    if (variant === 'primary') {
      baseStyle.backgroundColor = Colors.primary;
      baseStyle.shadowColor = Colors.primary;
      baseStyle.shadowOffset = { width: 0, height: 4 };
      baseStyle.shadowOpacity = 0.3;
      baseStyle.shadowRadius = 8;
      baseStyle.elevation = 6;
    } else if (variant === 'secondary') {
      baseStyle.backgroundColor = Colors.secondary;
      baseStyle.shadowColor = Colors.secondary;
      baseStyle.shadowOffset = { width: 0, height: 4 };
      baseStyle.shadowOpacity = 0.3;
      baseStyle.shadowRadius = 8;
      baseStyle.elevation = 6;
    } else if (variant === 'outline') {
      baseStyle.backgroundColor = 'transparent';
      baseStyle.borderWidth = 2;
      baseStyle.borderColor = Colors.primary;
    } else if (variant === 'text') {
      baseStyle.backgroundColor = 'transparent';
    }

    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
    };

    if (size === 'small') {
      baseStyle.fontSize = 14;
    } else if (size === 'medium') {
      baseStyle.fontSize = 16;
    } else if (size === 'large') {
      baseStyle.fontSize = 18;
    }

    if (variant === 'primary' || variant === 'secondary') {
      baseStyle.color = Colors.surface;
    } else if (variant === 'outline' || variant === 'text') {
      baseStyle.color = Colors.primary;
    }

    return baseStyle;
  };

  const shadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: variant === 'primary' || variant === 'secondary' ? [0.3, 0.15] : [0, 0],
  });

  const shadowRadius = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 4],
  });

  return (
    <Animated.View
      style={[
        getButtonStyle(),
        {
          transform: [{ scale: scaleAnim }],
          shadowOpacity: shadowOpacity,
          shadowRadius: shadowRadius,
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'secondary' ? Colors.surface : Colors.primary}
            size="small"
          />
        ) : (
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

