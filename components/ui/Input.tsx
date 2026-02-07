import React, { useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: object;
}

export default function Input({
  label,
  error,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...textInputProps
}: InputProps) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = (e: any) => {
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.01,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
    ]).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
    ]).start();
    onBlur?.(e);
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? Colors.error : Colors.border, error ? Colors.error : Colors.primary],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, error ? 0 : 0.1],
  });

  const elevationValue = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      {/* Outer wrapper for shadow/elevation (non-native driver) */}
      <Animated.View
        style={{
          shadowOpacity: shadowOpacity,
          shadowColor: error ? Colors.error : Colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
          elevation: elevationValue,
        }}
      >
        {/* Inner wrapper for transform (native driver) */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Animated.View
            style={[
              styles.inputContainer,
              {
                borderColor: borderColor,
              },
              error && styles.inputErrorContainer,
            ]}
          >
            <TextInput
              style={[
                styles.input,
                error && styles.inputError,
                style,
              ]}
              placeholderTextColor={Colors.textSecondary}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...textInputProps}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  input: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    color: Colors.text,
  },
  inputErrorContainer: {
    borderColor: Colors.error,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});

