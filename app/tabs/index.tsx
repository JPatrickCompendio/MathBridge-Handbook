import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Animated,
    Easing,
    Image,
    ImageBackground,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopicModal from '../../components/TopicModal';
import WelcomeModal from '../../components/WelcomeModal';
import TabsAnimatedBackground from '../../components/TabsAnimatedBackground';
import { BorderRadius, Spacing } from '../../constants/colors';
import { database } from '../../services/database';
import { getProfileOverlay, PROFILE_OVERLAY_UPDATED, setProfileOverlay } from '../../utils/profileStorage';
import { getTopicProgress } from '../../utils/progressStorage';
import { getSpacing, isSmallDevice, isTablet, isWeb, scaleFont, scaleSize, useResponsive, wp } from '../../utils/responsive';

const ProfessionalColors = {
  primary: '#FF6600',
  primaryDark: '#CC5200',
  white: '#FFFFFF',
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E5E5E5',
  error: '#DC2626',
  success: '#61E35D',
  warning: '#F59E0B',
  gradientStart: '#FF6600',
  gradientEnd: '#FF8C42',
};

// Fallback display name when not logged in
const DEFAULT_DISPLAY_NAME = 'Learner';

const EXAMPLE_TOPICS = [
  { id: 1, name: 'Quadratic Equations', progress: 0, icon: '🧮', subtitle: 'Solving Quadratic Equations' },
  { id: 2, name: 'Triangle Triples', progress: 0, icon: '🎯', subtitle: 'Identifying Triangle Triples' },
  { id: 3, name: 'Triangle Measures', progress: 0, icon: '△', subtitle: 'Similar Triangles & Oblique' },
  { id: 4, name: 'Area of Triangles', progress: 0, icon: '📐', subtitle: 'Area Formula & Problems' },
  { id: 5, name: 'Variation', progress: 0, icon: '📊', subtitle: 'Direct, Inverse, Joint & Combined' },
];

// Predefined colors for topics with better contrast
const TOPIC_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA726', '#AB47BC'
];

// Helper function to get image path based on topic name
const getTopicImage = (topicName: string): any => {
  const imageMap: { [key: string]: any } = {
    'Quadratic Equations': require('../../assets/images/geometry.png'),
    'Geometry': require('../../assets/images/geometry.png'),
    'Triangle Triples': require('../../assets/images/geometry.png'),
    'Pythagorean Triples': require('../../assets/images/geometry.png'),
    'Algebra': require('../../assets/images/algebra.png'),
    'Triangle Measures': require('../../assets/images/geometry.png'),
    'Statistics': require('../../assets/images/statistics.png'),
    'Area of Triangles': require('../../assets/images/trigonometry.png'),
    'Trigonometry': require('../../assets/images/trigonometry.png'),
    'Variation': require('../../assets/images/calculus.png'),
  };
  return imageMap[topicName] || require('../../assets/images/geometry.png'); // fallback
};

// Animated Search Bar Component
function AnimatedSearchBar({ 
  fadeAnim, 
  searchQuery, 
  setSearchQuery, 
  styles, 
  colors 
}: { 
  fadeAnim: Animated.Value; 
  searchQuery: string; 
  setSearchQuery: (value: string) => void; 
  styles: any; 
  colors: any;
}) {
  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const searchScaleAnim = useRef(new Animated.Value(1)).current;

  const handleSearchFocus = () => {
    Animated.parallel([
      Animated.timing(searchFocusAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.spring(searchScaleAnim, {
        toValue: 1.02,
        useNativeDriver: false,
        tension: 300,
        friction: 8,
      }),
    ]).start();
  };
  
  const handleSearchBlur = () => {
    Animated.parallel([
      Animated.timing(searchFocusAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.spring(searchScaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 300,
        friction: 8,
      }),
    ]).start();
  };
  
  const borderColor = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });
  
  const shadowOpacity = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.1],
  });
  
  const elevationValue = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
    extrapolate: 'clamp',
  });
  
  return (
    <Animated.View 
      style={[
        styles.searchSection as any,
        {
          opacity: fadeAnim,
          transform: [{
            translateX: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            }),
          }],
        },
      ]}
    >
      {/* Outer wrapper for shadow/elevation (non-native driver) */}
      <Animated.View
        style={[
          {
            shadowOpacity: shadowOpacity,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
            elevation: elevationValue,
          },
        ]}
      >
        {/* Inner wrapper for transform (native driver) */}
        <Animated.View
          style={[
            styles.searchBarContainer,
            {
              transform: [{ scale: searchScaleAnim }],
              borderColor: borderColor,
            },
          ]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

// Animated Stat Card Component with 3D effects
function AnimatedStatCard({ 
  value, 
  label, 
  delay, 
  styles 
}: { 
  value: number | string; 
  label: string; 
  delay: number; 
  styles: any;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: delay,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: delay,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3D tilt animation
    const tiltAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rotateX, {
            toValue: 0.03,
            duration: 3000 + delay * 50,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotateY, {
            toValue: 0.03,
            duration: 4000 + delay * 50,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(rotateX, {
            toValue: -0.03,
            duration: 3000 + delay * 50,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotateY, {
            toValue: -0.03,
            duration: 4000 + delay * 50,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]),
      { iterations: -1 }
    );

    // Floating animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000 + delay * 100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000 + delay * 100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );

    tiltAnimation.start();
    floatAnimation.start();

    return () => {
      tiltAnimation.stop();
      floatAnimation.stop();
    };
  }, [delay]);

  const combinedScale = Animated.multiply(scaleAnim, pulseAnim);

  const rotateXInterpolate = rotateX.interpolate({
    inputRange: [-0.05, 0.05],
    outputRange: ['-3deg', '3deg'],
  });

  const rotateYInterpolate = rotateY.interpolate({
    inputRange: [-0.05, 0.05],
    outputRange: ['-3deg', '3deg'],
  });

  const translateYFloat = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [
            { scale: combinedScale },
            { rotateX: rotateXInterpolate },
            { rotateY: rotateYInterpolate },
            { translateY: translateYFloat },
            { perspective: 1000 },
          ],
        },
      ]}
    >
      <View style={styles.statCardBorder} />
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// Animated Progress Bar Component (moved outside for reuse)
function AnimatedProgressBar({ progress, style, styles }: { progress: number; style?: any; styles: any }) {
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressWidth]);

  return (
    <View style={style ? [styles.topicProgressBarBackground, style] : styles.topicProgressBarBackground}>
      <Animated.View
        style={[
          styles.topicProgressBarFill as any,
          {
            width: progressWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

// Subtle shimmer overlay for header (animated)
function HeaderShimmer() {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.12,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: ProfessionalColors.white, opacity }]}
    />
  );
}

// Animated Background Component for Profile Header (white particles on orange)
function AnimatedProfileBackground() {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    translateX: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0.3)).current,
    scale: useRef(new Animated.Value(0.5)).current,
    rotate: useRef(new Animated.Value(0)).current,
    delay: i * 500,
  }));

  useEffect(() => {
    // Animate floating particles
    particles.forEach((particle) => {
      const translateXAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.translateX, {
            toValue: 1,
            duration: 4000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateX, {
            toValue: 0,
            duration: 4000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      );

      const translateYAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.translateY, {
            toValue: 1,
            duration: 5000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateY, {
            toValue: 0,
            duration: 5000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      );

      const opacityAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: 0.6,
            duration: 3000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0.3,
            duration: 3000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      );

      const scaleAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 3500 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0.5,
            duration: 3500 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      );

      const rotateAnim = Animated.loop(
        Animated.timing(particle.rotate, {
          toValue: 1,
          duration: 8000 + particle.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { iterations: -1 }
      );

      Animated.parallel([translateXAnim, translateYAnim, opacityAnim, scaleAnim, rotateAnim]).start();
    });
  }, []);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: scaleSize(24) }}>
      {/* Floating Particles */}
      {particles.map((particle, index) => {
        const translateX = particle.translateX.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, 30],
        });

        const translateY = particle.translateY.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 20],
        });

        const rotate = particle.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        const size = (index % 3 === 0 ? 8 : index % 3 === 1 ? 12 : 6) * scaleSize(1);
        const positions = [
          { left: '10%', top: '20%' },
          { left: '80%', top: '15%' },
          { left: '20%', top: '60%' },
          { left: '75%', top: '70%' },
          { left: '5%', top: '80%' },
          { left: '90%', top: '50%' },
          { left: '50%', top: '10%' },
          { left: '60%', top: '85%' },
        ];

        return (
          <Animated.View
            key={index}
            style={[
              {
                position: 'absolute' as const,
                ...positions[index],
                width: size,
                height: size,
                backgroundColor: ProfessionalColors.white,
                borderRadius: size / 2,
              } as any,
              {
                opacity: particle.opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { scale: particle.scale },
                  { rotate },
                ],
              },
            ]}
          />
        );
      })}

      {/* Very subtle overlay so particles don't overpower text */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 102, 0, 0.08)',
        }}
      />
    </View>
  );
}

// 3D Rotating Icon Component
function Rotating3DIcon({ icon, delay = 0 }: { icon: string; delay?: number }) {
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const rotateZ = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Infinite 3D rotation (faster)
    const rotateAnimation = Animated.loop(
      Animated.parallel([
        Animated.timing(rotateX, {
          toValue: 1,
          duration: 1800 + delay * 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotateY, {
          toValue: 1,
          duration: 2200 + delay * 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotateZ, {
          toValue: 1,
          duration: 2600 + delay * 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );

    // Floating animation (faster)
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 900 + delay * 40,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 900 + delay * 40,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );

    rotateAnimation.start();
    floatAnimation.start();

    return () => {
      rotateAnimation.stop();
      floatAnimation.stop();
    };
  }, [delay]);

  const rotateXInterpolate = rotateX.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateYInterpolate = rotateY.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateZInterpolate = rotateZ.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { rotateX: rotateXInterpolate },
          { rotateY: rotateYInterpolate },
          { rotateZ: rotateZInterpolate },
          { translateY: translateY },
          { perspective: 1000 },
        ],
      }}
    >
      <Text style={{ fontSize: scaleFont(isTablet() ? 28 : isSmallDevice() ? 18 : 22) }}>
        {icon}
      </Text>
    </Animated.View>
  );
}

// Animated Topic Card Component
function AnimatedTopicCard({ 
  topic, 
  index, 
  fadeAnim, 
  onPress, 
  styles, 
  colors 
}: { 
  topic: typeof EXAMPLE_TOPICS[0]; 
  index: number; 
  fadeAnim: Animated.Value; 
  onPress: (id: number) => void; 
  styles: any; 
  colors: any;
}) {
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.max(0, Math.min(100, topic.progress));
  const showActivitiesHint = clampedProgress >= 70 && clampedProgress < 100;
  
  useEffect(() => {
    // Subtle 3D tilt animation
    const tiltAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rotateX, {
            toValue: 0.05,
            duration: 3000 + index * 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotateY, {
            toValue: 0.05,
            duration: 4000 + index * 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(rotateX, {
            toValue: -0.05,
            duration: 3000 + index * 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotateY, {
            toValue: -0.05,
            duration: 4000 + index * 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]),
      { iterations: -1 }
    );

    // Floating animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500 + index * 150,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500 + index * 150,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );

    tiltAnimation.start();
    floatAnimation.start();

    return () => {
      tiltAnimation.stop();
      floatAnimation.stop();
    };
  }, [index]);
  
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 0.97,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotateXInterpolate = rotateX.interpolate({
    inputRange: [-0.1, 0.1],
    outputRange: ['-5deg', '5deg'],
  });

  const rotateYInterpolate = rotateY.interpolate({
    inputRange: [-0.1, 0.1],
    outputRange: ['-5deg', '5deg'],
  });

  const translateYFloat = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });
  
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          },
        ],
      }}
    >
      <Animated.View
        style={{
          transform: [
            { translateY: translateYFloat },
            { perspective: 1000 },
          ],
        }}
      >
        <TouchableOpacity
          onPress={() => onPress(topic.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={[
            styles.topicCardTouchable,
            { 
              shadowColor: TOPIC_COLORS[index % TOPIC_COLORS.length],
            },
          ]}
        >
          <Animated.View 
            style={{ 
              opacity: cardOpacity, 
              flex: 1,
              transform: [
                { scale: cardScale },
                { rotateX: rotateXInterpolate },
                { rotateY: rotateYInterpolate },
                { perspective: 1000 },
              ],
            }}
          >
            {/* Orange left border strip */}
            <View style={styles.topicCardBorder} />
            
            <ImageBackground
              source={getTopicImage(topic.name)}
              style={styles.topicCard}
              imageStyle={styles.topicCardImage}
              resizeMode="cover"
            >
              {/* Overlay for better text readability */}
              <View style={styles.topicCardOverlay} />
              
              <View style={styles.topicHeader}>
                <View style={styles.topicIconContainer}>
                  <Rotating3DIcon icon={topic.icon} delay={index * 100} />
                </View>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicName}>{topic.name}</Text>
                  <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
                </View>
                <View style={styles.topicPercentage}>
                  <Text style={styles.percentageText}>{Math.round(clampedProgress)}%</Text>
                </View>
              </View>

              {/* Animated Progress Bar */}
              <View style={styles.topicProgressContainer}>
                <View style={styles.progressLabels}>
                  <Text style={styles.topicProgressLabel}>Progress</Text>
                  <Text style={styles.topicProgressValue}>{Math.round(clampedProgress)}%</Text>
                </View>
                {showActivitiesHint && (
                  <Text style={styles.topicActivitiesHint}>
                    Play Activities to complete this topic and earn an achievement.
                  </Text>
                )}
                <AnimatedProgressBar 
                  progress={clampedProgress} 
                  style={styles.topicProgressBarBackground}
                  styles={styles}
                />
              </View>
            </ImageBackground>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ welcome?: string; username?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState(EXAMPLE_TOPICS);
  const [selectedTopic, setSelectedTopic] = useState<typeof EXAMPLE_TOPICS[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [displayName, setDisplayName] = useState(DEFAULT_DISPLAY_NAME);
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | undefined>(undefined);
  const [streak, setStreak] = useState(0);
  const [welcomeModalVisible, setWelcomeModalVisible] = useState(false);
  const [welcomeVariant, setWelcomeVariant] = useState<'new' | 'back'>('back');
  const [welcomeUsername, setWelcomeUsername] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const averageProgress = topics.length ? Math.round(topics.reduce((s, t) => s + t.progress, 0) / topics.length) : 0;
  const completedTopics = topics.filter((t) => t.progress >= 100).length;
  const level = 1 + Math.min(9, Math.floor(averageProgress / 10));

  // When profile is saved (e.g. from Profile tab), refresh header so photo/name update immediately (web only)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    const onProfileOverlayUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ displayName?: string; photoUri?: string }>).detail;
      if (detail) {
        if (detail.displayName !== undefined) setDisplayName(detail.displayName?.trim() || DEFAULT_DISPLAY_NAME);
        if (detail.photoUri !== undefined) setProfilePhotoUri(detail.photoUri || undefined);
      }
    };
    window.addEventListener(PROFILE_OVERLAY_UPDATED, onProfileOverlayUpdated);
    return () => window.removeEventListener(PROFILE_OVERLAY_UPDATED, onProfileOverlayUpdated);
  }, []);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: averageProgress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [averageProgress]);

  // Show welcome modal when arriving from signup (new) or login (back)
  useEffect(() => {
    const w = params.welcome;
    if (w === 'new' || w === 'back') {
      setWelcomeVariant(w);
      let name = '';
      if (typeof params.username === 'string' && params.username) {
        try {
          name = decodeURIComponent(params.username);
        } catch {
          name = params.username;
        }
      }
      setWelcomeUsername(name);
      setWelcomeModalVisible(true);
    }
  }, [params.welcome, params.username]);

  const handleCloseWelcomeModal = useCallback(() => {
    setWelcomeModalVisible(false);
    router.replace('/tabs');
  }, [router]);

  // Load progress, user, and streak when screen comes into focus; update streak on activity
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const savedProgress = await getTopicProgress();
          if (savedProgress && typeof savedProgress === 'object') {
            setTopics((prevTopics) =>
              prevTopics.map((topic) => ({
                ...topic,
                progress: (savedProgress && typeof savedProgress === 'object' ? savedProgress[topic.id] : undefined) ?? 0,
              }))
            );
          }
          const [overlay, user] = await Promise.all([getProfileOverlay(), database.getUserData()]);
          setDisplayName((overlay.displayName?.trim() || user?.username || user?.displayName) ?? DEFAULT_DISPLAY_NAME);
          // Web: prefer overlay then Firebase photoUrl; hydrate overlay from Firebase after login so photo persists
          if (Platform.OS === 'web') {
            const photoUri = overlay.photoUri || user?.photoUrl;
            setProfilePhotoUri(photoUri || undefined);
            if (user?.photoUrl && !overlay.photoUri) {
              setProfileOverlay({ photoUri: user.photoUrl, displayName: overlay.displayName || user?.displayName });
            }
          } else {
            setProfilePhotoUri(overlay.photoUri);
          }
          const newStreak = await database.setLastActivityAndStreak(new Date().toISOString());
          setStreak(newStreak);
        } catch (error) {
          console.log('Error loading home data:', error);
          try {
            const currentStreak = await database.getStreak();
            setStreak(currentStreak);
          } catch {
            setStreak(0);
          }
        }
      };
      load();
    }, [])
  );

  const handleTopicPress = (topicId: number) => {
    // Show modal with topic details
    const topic = topics.find((t) => t.id === topicId);
    if (topic) {
      setSelectedTopic(topic);
      setModalVisible(true);
    }
  };

  const handleEnterTopic = () => {
    if (selectedTopic) {
      setModalVisible(false);
      setTimeout(() => {
        // Always go directly to lesson content (never to /topic/[id])
        if (selectedTopic.name === 'Quadratic Equations' || selectedTopic.id === 1) {
          router.push('/lesson-menu/quadratic-equations' as any);
        } else if (selectedTopic.name === 'Triangle Triples' || selectedTopic.name === 'Pythagorean Triples' || selectedTopic.id === 2) {
          router.push('/lesson-menu/pythagorean-triples' as any);
        } else if (selectedTopic.name === 'Triangle Measures' || selectedTopic.id === 3) {
          router.push('/lesson-menu/triangle-measures' as any);
        } else if (selectedTopic.name === 'Area of Triangles' || selectedTopic.id === 4) {
          router.push('/lesson-menu/area-of-triangle' as any);
        } else if (selectedTopic.name === 'Variation' || selectedTopic.id === 5) {
          router.push('/lesson-menu/variation' as any);
        } else {
          router.push(`/topic/${selectedTopic.id}` as any);
        }
      }, 200);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTopic(null);
  };

  // Filter topics based on search query
  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { isWeb, isWideScreen, width: windowWidth } = useResponsive();
  const useWebLayout = isWeb && isWideScreen;
  const useNarrowWeb = isWeb && !isWideScreen; // web on mobile/narrow viewport
  const useFourColGrid = useWebLayout && windowWidth >= 1400;
  const useThreeColGrid = useWebLayout && windowWidth >= 1100 && !useFourColGrid;

  const getProgressLabel = (progress: number) => {
    if (progress >= 90) return 'Excellent! 🎉';
    if (progress >= 70) return 'Great job! 💪';
    if (progress >= 50) return 'Good progress! 📚';
    if (progress >= 30) return 'Keep going! 🔥';
    return 'Start learning! 🌟';
  };

  return (
    <View style={styles.container}>
      <TabsAnimatedBackground />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, useWebLayout && styles.scrollContentWeb]}
        showsVerticalScrollIndicator={false}
      >
        <View style={useWebLayout ? styles.webContentWrap : undefined}>
        {/* Enhanced Profile Header with Animations */}
        <Animated.View 
          style={[
            styles.profileHeader as any,
            useWebLayout && styles.profileHeaderWeb,
            useNarrowWeb && styles.profileHeaderNarrowWeb,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Orange gradient background with subtle shimmer animation */}
          <LinearGradient
            colors={[ProfessionalColors.primary, ProfessionalColors.primaryDark, ProfessionalColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <HeaderShimmer />
          <AnimatedProfileBackground />

          {/* Content Container with zIndex to appear above background */}
          <View style={[styles.profileContentInner, useWebLayout && styles.profileContentInnerWeb, useNarrowWeb && styles.profileContentInnerNarrowWeb]}>
            {/* Top Row: Avatar, Name, and Stats */}
            <View style={[styles.profileTopRow, useWebLayout && styles.profileTopRowWeb, useNarrowWeb && styles.profileTopRowNarrowWeb]}>
              <View style={styles.avatarContainer}>
                <Animated.View 
                  style={[
                    styles.avatar as any,
                    {
                      transform: [{
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      }],
                    },
                  ]}
                >
                  {profilePhotoUri ? (
                    <Image
                      key={profilePhotoUri}
                      source={{ uri: profilePhotoUri }}
                      style={styles.avatarImage as any}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {(displayName || 'L').charAt(0).toUpperCase()}
                    </Text>
                  )}
                </Animated.View>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Lvl {level}</Text>
                </View>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName} numberOfLines={useNarrowWeb ? 2 : 1}>{displayName || DEFAULT_DISPLAY_NAME}</Text>
                <View style={[styles.streakContainer, streak === 0 && styles.streakContainerInactive]}>
                  <Text style={styles.streakIcon}>🔥</Text>
                  <Text style={styles.streakText}>
                    {streak === 0 ? 'Start your streak' : streak === 1 ? '1 day streak' : `${streak} day streak`}
                  </Text>
                </View>
              </View>

              <View style={styles.progressCircle}>
                <Text style={styles.progressPercentage} numberOfLines={1}>
                  {Math.round(averageProgress)}%
                </Text>
                <Text style={styles.progressLabel}>Overall</Text>
              </View>
            </View>

            {/* Progress Section with Animated Bar — on web sits beside top row for wide compact header */}
            <View style={[styles.progressSection, useWebLayout && styles.progressSectionWeb, useNarrowWeb && styles.progressSectionNarrowWeb]}>
              <View style={[styles.progressHeader, useWebLayout && styles.progressHeaderWeb]}>
                <Text style={styles.progressTitle}>Your Learning Progress</Text>
                <Text style={styles.progressSubtitle}>
                  {completedTopics > 0 ? `${completedTopics}/${topics.length} topics completed · ` : ''}
                  {getProgressLabel(Math.round(averageProgress))}
                </Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressMin}>0%</Text>
                  <Text style={styles.progressMax}>100%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill as any,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressMarker}>
                  <Text style={styles.progressMarkerText}>
                    {Math.round(averageProgress)}% Complete
                  </Text>
                </View>
              </View>
            </View>

            {/* Web-only: extra stats row */}
            {useWebLayout && (
              <View style={styles.headerExtraRow}>
                <View style={[styles.headerChip, styles.headerChipWeb]}>
                  <Text style={[styles.headerChipIcon, styles.headerChipIconWeb]}>📚</Text>
                  <Text style={[styles.headerChipText, styles.headerChipTextWeb]}>{completedTopics}/{topics.length} topics mastered</Text>
                </View>
                <View style={[styles.headerChip, styles.headerChipWeb]}>
                  <Text style={[styles.headerChipIcon, styles.headerChipIconWeb]}>🎯</Text>
                  <Text style={[styles.headerChipText, styles.headerChipTextWeb]}>{getProgressLabel(Math.round(averageProgress))}</Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Animated Search Bar with Focus Animation */}
        <AnimatedSearchBar 
          fadeAnim={fadeAnim}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          styles={styles}
          colors={ProfessionalColors}
        />

        {/* Animated Section Header */}
        <Animated.View 
          style={[
            styles.sectionHeader as any,
            {
              opacity: fadeAnim,
              transform: [{
                translateX: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredTopics.length} topics available
          </Text>
        </Animated.View>

        {/* Animated Topics List — grid on web for landscape/website layout */}
        <View style={[styles.topicsList, useWebLayout && styles.topicsListWeb]}>
          {filteredTopics.map((topic, index) => (
            <View key={topic.id} style={useWebLayout ? (useFourColGrid ? styles.topicCardWrapperWeb4Col : useThreeColGrid ? styles.topicCardWrapperWeb3Col : styles.topicCardWrapperWeb) : undefined}>
              <AnimatedTopicCard
                topic={topic}
                index={index}
                fadeAnim={fadeAnim}
                onPress={handleTopicPress}
                styles={styles}
                colors={ProfessionalColors}
              />
            </View>
          ))}
        </View>

        {/* Animated Quick Stats */}
        <Animated.View 
          style={[
            styles.quickStats as any,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              }],
            },
          ]}
        >
          {[
            { value: topics.length, label: 'Total Topics', delay: 0 },
            { value: topics.filter(t => t.progress >= 100).length, label: 'Completed', delay: 100 },
            { value: Math.round(averageProgress) + '%', label: 'Avg. Progress', delay: 200 },
          ].map((stat, index) => (
            <AnimatedStatCard
              key={index}
              value={stat.value}
              label={stat.label}
              delay={stat.delay}
              styles={styles}
            />
          ))}
        </Animated.View>
        </View>
      </ScrollView>

      {/* Topic Selection Modal */}
      <TopicModal
        visible={modalVisible}
        topic={selectedTopic}
        onClose={handleCloseModal}
        onEnter={handleEnterTopic}
        getTopicImage={getTopicImage}
      />

      <WelcomeModal
        visible={welcomeModalVisible}
        variant={welcomeVariant}
        username={welcomeUsername}
        onClose={handleCloseWelcomeModal}
      />
    </SafeAreaView>
    </View>
  );
}

// Web: larger header text and avatar; mobile/tablet unchanged
const responsiveValues = {
  paddingH: isWeb() ? getSpacing(Spacing.lg) : (isTablet() ? wp(6) : wp(5)),
  cardMaxWidth: isWeb() ? undefined : isTablet() ? 800 : undefined,
  topicCardMarginH: isTablet() ? wp(2) : 0,
  avatarSize: isWeb() ? 64 : (isTablet() ? 90 : isSmallDevice() ? 60 : 70),
  avatarRadius: isWeb() ? 32 : (isTablet() ? 45 : isSmallDevice() ? 30 : 35),
  avatarFont: isWeb() ? 28 : (isTablet() ? 36 : isSmallDevice() ? 24 : 28),
  titleFont: isWeb() ? 22 : (isTablet() ? 28 : isSmallDevice() ? 18 : 22),
  welcomeFont: isWeb() ? 16 : (isTablet() ? 16 : isSmallDevice() ? 12 : 14),
  progressCircleSize: isWeb() ? 68 : (isTablet() ? 90 : isSmallDevice() ? 60 : 70),
  progressFont: isWeb() ? 20 : (isTablet() ? 22 : isSmallDevice() ? 14 : 18),
  progressLabelFont: isWeb() ? 12 : (isTablet() ? 12 : isSmallDevice() ? 8 : 10),
  sectionTitleFont: isWeb() ? 20 : (isTablet() ? 30 : isSmallDevice() ? 20 : 24),
  sectionSubtitleFont: isWeb() ? 13 : (isTablet() ? 16 : isSmallDevice() ? 12 : 14),
  topicIconSize: isWeb() ? 46 : (isTablet() ? 68 : isSmallDevice() ? 44 : 56),
  topicIconRadius: isWeb() ? 23 : (isTablet() ? 34 : isSmallDevice() ? 22 : 28),
  topicIconFont: isWeb() ? 20 : (isTablet() ? 32 : isSmallDevice() ? 20 : 25),
  topicNameFont: isWeb() ? 15 : (isTablet() ? 22 : isSmallDevice() ? 16 : 18),
  topicSubtitleFont: isWeb() ? 11 : (isTablet() ? 14 : isSmallDevice() ? 10 : 12),
  statCardMaxWidth: isTablet() ? 250 : undefined,
  statNumberFont: isWeb() ? 18 : (isTablet() ? 26 : isSmallDevice() ? 16 : 20),
  statLabelFont: isWeb() ? 11 : (isTablet() ? 14 : isSmallDevice() ? 10 : 12),
  searchFont: isWeb() ? 15 : (isTablet() ? 18 : isSmallDevice() ? 14 : 16),
  searchIconFont: isWeb() ? 18 : (isTablet() ? 20 : isSmallDevice() ? 16 : 18),
  progressTitleFont: isWeb() ? 18 : (isTablet() ? 20 : isSmallDevice() ? 14 : 16),
  progressSubtitleFont: isWeb() ? 14 : (isTablet() ? 16 : isSmallDevice() ? 12 : 14),
  progressBarHeight: isWeb() ? 10 : (isTablet() ? 14 : isSmallDevice() ? 10 : 12),
  topicProgressBarHeight: isWeb() ? 6 : (isTablet() ? 10 : isSmallDevice() ? 6 : 8),
  levelFont: isWeb() ? 11 : (isTablet() ? 12 : isSmallDevice() ? 8 : 10),
  streakFont: isWeb() ? 13 : (isTablet() ? 14 : isSmallDevice() ? 10 : 12),
  streakIconFont: isWeb() ? 14 : (isTablet() ? 16 : isSmallDevice() ? 12 : 14),
  topicCardMinHeight: isWeb() ? 180 : 200,
  searchBarMaxWidth: isWeb() ? 640 : undefined,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProfessionalColors.background,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getSpacing(Spacing.xxl) + 80,
  },
  scrollContentWeb: {
    alignItems: 'center',
  },
  webContentWrap: {
    width: '100%',
    paddingHorizontal: getSpacing(Spacing.lg),
    alignSelf: 'stretch',
    flex: 1,
  },
  // Enhanced Profile Header (orange gradient applied in JSX)
  profileHeader: {
    backgroundColor: 'transparent',
    padding: getSpacing(Spacing.xl),
    marginTop: getSpacing(Spacing.md),
    marginHorizontal: responsiveValues.paddingH,
    borderRadius: scaleSize(24),
    minHeight: scaleSize(200),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.08,
    shadowRadius: scaleSize(12),
    elevation: 6,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'stretch',
    overflow: 'hidden',
    position: 'relative',
  },
  profileHeaderWeb: {
    padding: getSpacing(Spacing.lg),
    marginTop: getSpacing(Spacing.sm),
    borderRadius: scaleSize(14),
    minHeight: scaleSize(140),
    borderLeftWidth: scaleSize(4),
    borderLeftColor: 'rgba(255, 255, 255, 0.4)',
  },
  profileHeaderNarrowWeb: {
    marginHorizontal: getSpacing(Spacing.sm),
    padding: getSpacing(Spacing.md),
    minHeight: scaleSize(140),
    borderRadius: scaleSize(12),
  },
  profileContentInner: {
    position: 'relative',
    zIndex: 1,
  },
  profileContentInnerWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: getSpacing(Spacing.md),
  },
  profileContentInnerNarrowWeb: {
    width: '100%',
    minWidth: 0,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.lg),
    gap: getSpacing(Spacing.md),
  },
  profileTopRowWeb: {
    marginBottom: 0,
    flex: 1,
    minWidth: 240,
    maxWidth: 360,
    gap: getSpacing(Spacing.sm),
  },
  profileTopRowNarrowWeb: {
    flexWrap: 'wrap',
    minWidth: 0,
    maxWidth: '100%',
  },
  progressSectionWeb: {
    marginTop: 0,
    flex: 1.3,
    minWidth: 240,
  },
  progressSectionNarrowWeb: {
    width: '100%',
    minWidth: 0,
  },
  progressHeaderWeb: {
    marginBottom: getSpacing(Spacing.xs),
  },
  headerExtraRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getSpacing(Spacing.sm),
    marginTop: getSpacing(Spacing.sm),
    paddingTop: getSpacing(Spacing.sm),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
  },
  headerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.xs),
    borderRadius: scaleSize(20),
  },
  headerChipWeb: {
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: scaleSize(5),
    borderRadius: scaleSize(20),
  },
  headerChipIcon: {
    fontSize: scaleFont(14),
    marginRight: getSpacing(Spacing.xs),
  },
  headerChipIconWeb: {
    fontSize: scaleFont(15),
    marginRight: getSpacing(Spacing.xs),
  },
  headerChipText: {
    fontSize: scaleFont(13),
    color: ProfessionalColors.white,
    fontWeight: '600',
  },
  headerChipTextWeb: {
    fontSize: scaleFont(14),
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 0,
  },
  avatar: {
    width: scaleSize(responsiveValues.avatarSize),
    height: scaleSize(responsiveValues.avatarSize),
    borderRadius: scaleSize(responsiveValues.avatarRadius),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(8) },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(12),
    elevation: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: scaleSize(responsiveValues.avatarRadius),
  },
  avatarText: {
    fontSize: scaleFont(responsiveValues.avatarFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -scaleSize(5),
    right: -scaleSize(5),
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: getSpacing(Spacing.sm),
    paddingVertical: scaleSize(4),
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(4),
    elevation: 3,
  },
  levelText: {
    fontSize: scaleFont(responsiveValues.levelFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  welcomeText: {
    fontSize: scaleFont(responsiveValues.welcomeFont),
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: scaleSize(2),
    fontWeight: '500',
  },
  userName: {
    fontSize: scaleFont(responsiveValues.titleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
    marginBottom: getSpacing(Spacing.xs),
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: getSpacing(Spacing.sm),
    paddingVertical: scaleSize(5),
    borderRadius: scaleSize(12),
    alignSelf: 'flex-start',
  },
  streakContainerInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  streakIcon: {
    fontSize: scaleFont(responsiveValues.streakIconFont),
    marginRight: scaleSize(4),
  },
  streakText: {
    fontSize: scaleFont(responsiveValues.streakFont),
    color: ProfessionalColors.white,
    fontWeight: '600',
  },
  progressCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: getSpacing(Spacing.md),
    borderRadius: scaleSize(20),
    minWidth: scaleSize(responsiveValues.progressCircleSize),
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(8),
    elevation: 4,
  },
  progressPercentage: {
    fontSize: scaleFont(responsiveValues.progressFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  progressLabel: {
    fontSize: scaleFont(responsiveValues.progressLabelFont),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  progressSection: {
    marginTop: getSpacing(Spacing.md),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.md),
  },
  progressTitle: {
    fontSize: scaleFont(responsiveValues.progressTitleFont),
    fontWeight: '700',
    color: ProfessionalColors.white,
    flex: 1,
  },
  progressSubtitle: {
    fontSize: scaleFont(responsiveValues.progressSubtitleFont),
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: getSpacing(Spacing.sm),
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getSpacing(Spacing.xs),
  },
  progressMin: {
    fontSize: scaleFont(responsiveValues.progressLabelFont),
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  progressMax: {
    fontSize: scaleFont(responsiveValues.progressLabelFont),
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  progressBarBackground: {
    height: scaleSize(responsiveValues.progressBarHeight),
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.full,
  },
  progressMarker: {
    alignItems: 'center',
    marginTop: getSpacing(Spacing.xs),
  },
  progressMarkerText: {
    fontSize: scaleFont(responsiveValues.progressLabelFont),
    color: ProfessionalColors.white,
    fontWeight: '700',
  },
  // Search Section
  searchSection: {
    paddingTop: getSpacing(Spacing.md),
    paddingBottom: getSpacing(Spacing.md),
    paddingHorizontal: responsiveValues.paddingH,
    alignItems: isWeb() ? 'center' : undefined,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: getSpacing(Spacing.lg),
    paddingVertical: getSpacing(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(12),
    elevation: 6,
    maxWidth: responsiveValues.searchBarMaxWidth ?? responsiveValues.cardMaxWidth,
    alignSelf: isWeb() ? 'center' : 'stretch',
    width: isWeb() ? '100%' : undefined,
  },
  searchIcon: {
    fontSize: scaleFont(responsiveValues.searchIconFont),
    color: ProfessionalColors.textSecondary,
    marginRight: getSpacing(Spacing.sm),
  },
  searchInput: {
    flex: 1,
    fontSize: scaleFont(responsiveValues.searchFont),
    color: ProfessionalColors.text,
    fontWeight: '500',
  },
  clearButton: {
    padding: scaleSize(4),
    marginLeft: getSpacing(Spacing.xs),
  },
  clearIcon: {
    fontSize: scaleFont(responsiveValues.searchIconFont),
    color: ProfessionalColors.textSecondary,
    fontWeight: 'bold',
  },
  // Section Header
  sectionHeader: {
    paddingHorizontal: responsiveValues.paddingH,
    marginBottom: getSpacing(Spacing.md),
  },
  sectionTitle: {
    fontSize: scaleFont(responsiveValues.sectionTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  sectionSubtitle: {
    fontSize: scaleFont(responsiveValues.sectionSubtitleFont),
    color: ProfessionalColors.textSecondary,
    fontWeight: '500',
  },
  // Topics List
  topicsList: {
    paddingHorizontal: responsiveValues.paddingH,
    gap: getSpacing(Spacing.md),
    paddingBottom: getSpacing(Spacing.sm),
  },
  topicsListWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicCardWrapperWeb: {
    width: '48%',
    marginBottom: getSpacing(Spacing.md),
  },
  topicCardWrapperWeb3Col: {
    width: '31%',
    marginBottom: getSpacing(Spacing.md),
  },
  topicCardWrapperWeb4Col: {
    width: '23.5%',
    marginBottom: getSpacing(Spacing.md),
  },
  topicCardTouchable: {
    marginHorizontal: 0,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'stretch',
    borderRadius: BorderRadius.lg - 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(6) },
    shadowOpacity: 0.25,
    shadowRadius: scaleSize(12),
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  topicCardBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: scaleSize(6),
    backgroundColor: ProfessionalColors.primary,
    zIndex: 10,
    borderTopLeftRadius: BorderRadius.lg - 1,
    borderBottomLeftRadius: BorderRadius.lg - 1,
  },
  topicCard: {
    flex: 1,
    padding: getSpacing(Spacing.xl),
    paddingLeft: getSpacing(Spacing.xl) + scaleSize(6),
    overflow: 'hidden',
    minHeight: scaleSize(responsiveValues.topicCardMinHeight),
    borderTopRightRadius: BorderRadius.lg - 1,
    borderBottomRightRadius: BorderRadius.lg - 1,
  },
  topicCardImage: {
    borderTopRightRadius: BorderRadius.lg - 1,
    borderBottomRightRadius: BorderRadius.lg - 1,
    opacity: 0.7,
  },
  topicCardOverlay: {
    position: 'absolute',
    top: 0,
    left: scaleSize(6),
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTopRightRadius: BorderRadius.lg - 1,
    borderBottomRightRadius: BorderRadius.lg - 1,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.md),
    flexWrap: isSmallDevice() ? 'wrap' : 'nowrap',
    zIndex: 1,
  },
  topicIconContainer: {
    width: scaleSize(responsiveValues.topicIconSize),
    height: scaleSize(responsiveValues.topicIconSize),
    borderRadius: scaleSize(responsiveValues.topicIconRadius),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 2,
    marginBottom: isSmallDevice() ? getSpacing(Spacing.xs) : 0,
  },
  topicIcon: {
    fontSize: scaleFont(responsiveValues.topicIconFont),
  },
  topicInfo: {
    flex: 1,
    marginTop: isSmallDevice() ? getSpacing(Spacing.xs) : 0,
  },
  topicName: {
    fontSize: scaleFont(responsiveValues.topicNameFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
    marginBottom: scaleSize(2),
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  topicSubtitle: {
    fontSize: scaleFont(responsiveValues.topicSubtitleFont),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  topicPercentage: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: getSpacing(Spacing.sm),
    paddingVertical: scaleSize(6),
    borderRadius: BorderRadius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 2,
    marginTop: isSmallDevice() ? getSpacing(Spacing.xs) : 0,
    alignSelf: isSmallDevice() ? 'flex-start' : 'auto',
  },
  percentageText: {
    fontSize: scaleFont(responsiveValues.topicSubtitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  topicProgressContainer: {
    marginTop: getSpacing(Spacing.sm),
    zIndex: 1,
  },
  topicProgressLabel: {
    fontSize: scaleFont(responsiveValues.topicSubtitleFont),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  topicProgressValue: {
    fontSize: scaleFont(responsiveValues.topicSubtitleFont),
    color: ProfessionalColors.white,
    fontWeight: '700',
  },
  topicActivitiesHint: {
    marginTop: getSpacing(Spacing.xs),
    fontSize: scaleFont(responsiveValues.topicSubtitleFont - 2),
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  topicProgressBarBackground: {
    height: scaleSize(responsiveValues.topicProgressBarHeight),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: getSpacing(Spacing.xs),
  },
  topicProgressBarFill: {
    height: '100%',
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.full,
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: responsiveValues.paddingH,
    marginTop: getSpacing(Spacing.lg),
    gap: getSpacing(Spacing.md),
    flexWrap: 'nowrap',
  },
  statCard: {
    flex: 1,
    backgroundColor: ProfessionalColors.white,
    padding: getSpacing(Spacing.md),
    paddingLeft: getSpacing(Spacing.md) + scaleSize(6),
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(10),
    elevation: 6,
    minWidth: 0,
    maxWidth: responsiveValues.statCardMaxWidth,
    position: 'relative',
    overflow: 'hidden',
  },
  statCardBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: scaleSize(6),
    backgroundColor: ProfessionalColors.primary,
    zIndex: 10,
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  statNumber: {
    fontSize: scaleFont(responsiveValues.statNumberFont),
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: scaleSize(4),
  },
  statLabel: {
    fontSize: scaleFont(responsiveValues.statLabelFont),
    color: ProfessionalColors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});