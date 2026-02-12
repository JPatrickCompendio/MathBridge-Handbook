import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    ImageBackground,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BorderRadius, Spacing } from '../constants/colors';
import { getSpacing, scaleFont, scaleSize, wp } from '../utils/responsive';

const ProfessionalColors = {
  primary: '#10B981',
  primaryDark: '#047857',
  white: '#FFFFFF',
  background: '#FAFAFA',
  text: '#1A1A1A',
  textSecondary: '#666666',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

interface TopicModalProps {
  visible: boolean;
  topic: {
    id: number;
    name: string;
    progress: number;
    icon: string;
    subtitle: string;
  } | null;
  onClose: () => void;
  onEnter: () => void;
  getTopicImage: (name: string) => any;
}

// Animated Button Component for Modal
function AnimatedButton({
  onPress,
  title,
  variant,
  delay,
}: {
  onPress: () => void;
  title: string;
  variant: 'cancel' | 'enter';
  delay: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current; // Start visible
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate scale after delay
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: delay,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const buttonStyle = variant === 'enter' ? styles.enterButton : styles.cancelButton;
  const textStyle = variant === 'enter' ? styles.enterButtonText : styles.cancelButtonText;
  const combinedScale = Animated.multiply(scaleAnim, buttonScale);

  return (
    <Animated.View
      style={[
        {
          opacity: opacityAnim,
          transform: [
            { scale: combinedScale },
          ],
        },
        styles.buttonWrapper,
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={{ opacity: 1 }}>
          <Text style={textStyle} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function TopicModal({
  visible,
  topic,
  onClose,
  onEnter,
  getTopicImage,
}: TopicModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && topic) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideAnim.setValue(50);
      rotateAnim.setValue(0);
      progressAnim.setValue(0);

      // Start entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: topic.progress,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();

      // Continuous rotation animation for icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, topic]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleEnter = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onEnter();
    });
  };

  if (!topic) return null;

  const clampedProgress = Math.round(Math.max(0, Math.min(100, topic.progress)));
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Background Image */}
            <ImageBackground
              source={getTopicImage(topic.name)}
              style={styles.modalBackground}
              imageStyle={styles.modalBackgroundImage}
              resizeMode="cover"
            >
              {/* Overlay */}
              <View style={styles.modalOverlay} />

              {/* Content */}
              <View style={styles.modalContent}>
                {/* Close Button (X icon) */}
                <TouchableOpacity
                  style={styles.closeIconButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>

                {/* Icon with rotation animation */}
                <Animated.View
                  style={[
                    styles.iconContainer,
                    {
                      transform: [{ rotate: rotate }],
                    },
                  ]}
                >
                  <Text style={styles.icon}>{topic.icon}</Text>
                </Animated.View>

                {/* Topic Name */}
                <Text style={styles.topicName}>{topic.name}</Text>
                <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>

                {/* Progress Section */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Your Progress</Text>
                    <Text style={styles.progressValue}>{clampedProgress}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                  <AnimatedButton
                    onPress={handleEnter}
                    title="Enter →"
                    variant="enter"
                    delay={400}
                  />
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: ProfessionalColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp(90),
    maxWidth: 400,
    borderRadius: scaleSize(24),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(10) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(20),
    elevation: 20,
  },
  modalBackground: {
    width: '100%',
    minHeight: 400,
  },
  modalBackgroundImage: {
    borderRadius: scaleSize(24),
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: scaleSize(24),
  },
  modalContent: {
    padding: getSpacing(Spacing.xl),
    alignItems: 'center',
    minHeight: 400,
    justifyContent: 'space-between',
    position: 'relative',
  },
  closeIconButton: {
    position: 'absolute',
    top: getSpacing(Spacing.md),
    right: getSpacing(Spacing.md),
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: scaleSize(18),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeIcon: {
    fontSize: scaleFont(20),
    color: ProfessionalColors.white,
    fontWeight: 'bold',
  },
  iconContainer: {
    width: scaleSize(100),
    height: scaleSize(100),
    borderRadius: scaleSize(50),
    backgroundColor: ProfessionalColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.lg),
    borderWidth: 3,
    borderColor: ProfessionalColors.primary,
  },
  icon: {
    fontSize: scaleFont(50),
  },
  topicName: {
    fontSize: scaleFont(32),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
    marginBottom: getSpacing(Spacing.sm),
    textAlign: 'center',
  },
  topicSubtitle: {
    fontSize: scaleFont(16),
    color: ProfessionalColors.white + 'DD',
    marginBottom: getSpacing(Spacing.xl),
    textAlign: 'center',
  },
  progressSection: {
    width: '100%',
    marginBottom: getSpacing(Spacing.xl),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.sm),
  },
  progressLabel: {
    fontSize: scaleFont(14),
    color: ProfessionalColors.white + 'CC',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: scaleFont(18),
    color: ProfessionalColors.white,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: scaleSize(8),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: scaleSize(4),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ProfessionalColors.primary,
    borderRadius: scaleSize(4),
  },
  actionsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: getSpacing(Spacing.sm),
    flexWrap: 'wrap',
  },
  buttonWrapper: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
    minHeight: scaleSize(48),
    paddingVertical: getSpacing(Spacing.md),
    paddingHorizontal: getSpacing(Spacing.lg),
    borderRadius: scaleSize(BorderRadius.md),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'visible',
  },
  cancelButtonText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  enterButton: {
    flex: 1,
    minHeight: scaleSize(48),
    paddingVertical: getSpacing(Spacing.md),
    paddingHorizontal: getSpacing(Spacing.lg),
    borderRadius: scaleSize(BorderRadius.md),
    backgroundColor: ProfessionalColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.4,
    shadowRadius: scaleSize(8),
    elevation: 8,
    overflow: 'visible',
  },
  enterButtonText: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

