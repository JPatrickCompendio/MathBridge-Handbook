import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../constants/colors';
import { getSpacing, scaleFont, scaleSize, wp } from '../utils/responsive';

const colors = {
  primary: '#10B981',
  primaryDark: '#047857',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export type WelcomeVariant = 'new' | 'back';

interface WelcomeModalProps {
  visible: boolean;
  variant: WelcomeVariant;
  username?: string;
  onClose: () => void;
}

export default function WelcomeModal({
  visible,
  variant,
  username,
  onClose,
}: WelcomeModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  const isNew = variant === 'new';
  const displayName = username?.trim() || 'there';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.cardWrap,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Text style={styles.emoji}>{isNew ? '👋' : '🎉'}</Text>
              </View>
              <Text style={styles.title}>
                {isNew ? `Welcome, ${displayName}!` : 'Welcome back!'}
              </Text>
              <Text style={styles.subtitle}>
                {isNew
                  ? "You're all set. Explore topics, take quizzes, and track your progress."
                  : "Good to see you again. Pick up where you left off and keep learning."}
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  {isNew ? 'Get started' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing(Spacing.xl),
  },
  cardWrap: {
    width: '100%',
    maxWidth: 340,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.xxl),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    marginBottom: getSpacing(Spacing.lg),
  },
  emoji: {
    fontSize: scaleFont(48),
  },
  title: {
    fontSize: scaleFont(22),
    fontWeight: '700',
    color: colors.text,
    marginBottom: getSpacing(Spacing.sm),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scaleFont(15),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: scaleFont(22),
    marginBottom: getSpacing(Spacing.xl),
    paddingHorizontal: wp(2),
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: getSpacing(Spacing.md),
    paddingHorizontal: getSpacing(Spacing.xxl),
    borderRadius: scaleSize(BorderRadius.md),
    minWidth: scaleSize(160),
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
});
