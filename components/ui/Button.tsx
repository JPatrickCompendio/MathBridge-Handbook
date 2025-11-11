import React from 'react';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
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

    // Variant styles
    if (variant === 'primary') {
      baseStyle.backgroundColor = Colors.primary;
    } else if (variant === 'secondary') {
      baseStyle.backgroundColor = Colors.secondary;
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

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
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
  );
}

