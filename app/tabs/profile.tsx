import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabsAnimatedBackground from '../../components/TabsAnimatedBackground';
import { BorderRadius, Spacing } from '../../constants/colors';
import { database } from '../../services/database';
import { getProfileOverlay, setProfileOverlay } from '../../utils/profileStorage';
import { getTopicProgress, resetTopicProgress } from '../../utils/progressStorage';
import { getSpacing, isSmallDevice, isTablet, isWeb, scaleFont, scaleSize, wp } from '../../utils/responsive';

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
};

// Default user display — real data loaded from database (username shown as name)
const getDefaultUser = () => ({
  name: '',
  email: '',
  memberSince: '',
  avatar: '',
});

// Statistics — will be loaded from database
const DEFAULT_STATS = {
  topicsMastered: 0,
  totalTopics: 5,
  averageScore: 0,
  quizzesCompleted: 0,
  currentStreak: 0,
  learningTime: 0,
  achievementPoints: 0,
};

// Topics with progress (match home screen; progress loaded from storage)
const TOPICS = [
  { id: 1, name: 'Quadratic Equations', progress: 0, icon: '🧮' },
  { id: 2, name: 'Pythagorean Triples', progress: 0, icon: '🎯' },
  { id: 3, name: 'Triangle Measures', progress: 0, icon: '△' },
  { id: 4, name: 'Area of Triangles', progress: 0, icon: '📐' },
  { id: 5, name: 'Variation', progress: 0, icon: '📊' },
];

const getProgressColor = (progress: number) => {
  if (progress >= 71) return ProfessionalColors.success;
  if (progress >= 41) return ProfessionalColors.warning;
  return ProfessionalColors.error;
};

// Animated Stat Card Component
function AnimatedStatCard({ 
  icon, 
  value, 
  label, 
  index,
  delay = 0 
}: { 
  icon: string; 
  value: string | number; 
  label: string; 
  index: number;
  delay?: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
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

    // Card pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000 + index * 100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000 + index * 100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    ).start();

    // Icon pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.15,
          duration: 1500 + index * 100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1500 + index * 100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2500 + index * 150,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2500 + index * 150,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
      { iterations: -1 }
    ).start();
  }, [delay, index]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  const combinedScale = Animated.multiply(Animated.multiply(scaleAnim, pressScale), pulseAnim);

  const gradientColors: [string, string][] = [
    ['#FF6600', '#FF8C42'],
    ['#4ECDC4', '#45B7D1'],
    ['#61E35D', '#4ECDC4'],
    ['#FF6B6B', '#FFA726'],
    ['#AB47BC', '#9B59B6'],
    ['#FFA726', '#FFCC80'],
  ];

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { scale: combinedScale },
        ],
      }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.statCard}
      >
        <LinearGradient
          colors={gradientColors[index % gradientColors.length]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Glow effect */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: gradientColors[index % gradientColors.length][0],
              opacity: glowOpacity,
              borderRadius: scaleSize(BorderRadius.lg),
            },
          ]}
        />
        <Animated.View
          style={{
            transform: [{ scale: iconPulse }],
          }}
        >
          <Text style={styles.statIcon}>{icon}</Text>
        </Animated.View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Animated Action Item Component
function AnimatedActionItem({
  icon,
  text,
  textColor,
  onPress,
  index,
  delay = 0,
}: {
  icon: string;
  text: string;
  textColor?: string;
  onPress: () => void;
  index: number;
  delay?: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: delay,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        delay: delay,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Icon pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.1,
          duration: 1500 + index * 100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1500 + index * 100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    ).start();
  }, [delay, index]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { translateX: slideAnim },
          { scale: pressScale },
        ],
      }}
    >
      <TouchableOpacity
        style={styles.actionItem}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.actionLeft}>
          <Animated.View
            style={{
              transform: [{ scale: iconPulse }],
            }}
          >
            <Text style={styles.actionIcon}>{icon}</Text>
          </Animated.View>
          <Text style={[styles.actionText, textColor && { color: textColor }]}>
            {text}
          </Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Animated Logout Button Component
function AnimatedLogoutButton({ 
  onPress,
  fadeAnim 
}: { 
  onPress: () => void;
  fadeAnim: Animated.Value;
}) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
      { iterations: -1 }
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: pressScale }],
        marginHorizontal: isWeb() ? 0 : responsiveValues.paddingH,
        marginTop: getSpacing(Spacing.xl),
        marginBottom: getSpacing(Spacing.lg),
        maxWidth: responsiveValues.logoutButtonMaxWidth ?? responsiveValues.cardMaxWidth,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={[ProfessionalColors.error, '#FF4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: ProfessionalColors.error,
              opacity: glowOpacity,
              borderRadius: scaleSize(BorderRadius.lg),
            },
          ]}
        />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Animated Progress Item Component (uses pixel width for Android compatibility; avoid % in animated values)
function AnimatedProgressItem({ 
  topic, 
  index,
  onPress 
}: { 
  topic: typeof TOPICS[0]; 
  index: number;
  onPress: (topicId: number) => void;
}) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const [barWidth, setBarWidth] = useState(0);
  const progress = typeof topic.progress === 'number' ? Math.max(0, Math.min(100, topic.progress)) : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: index * 80,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        delay: index * 80,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: progress,
        delay: index * 80 + 200,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [index, progress]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const progressColor = getProgressColor(progress);
  const fillWidth = barWidth > 0
    ? progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [0, barWidth],
      })
    : 0;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale: pressScale },
        ],
      }}
    >
      <TouchableOpacity
        style={styles.progressItem}
        onPress={() => onPress(topic.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.progressItemHeader}>
          <View style={styles.progressItemLeft}>
            <Text style={styles.topicIcon}>{topic.icon}</Text>
            <Text style={styles.topicName}>{topic.name}</Text>
          </View>
          <Text style={[styles.progressPercentage, { color: progressColor }]}>
            {Math.round(progress)}%
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={styles.progressBarBackground}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (typeof w === 'number' && w > 0) setBarWidth(w);
            }}
          >
            {barWidth > 0 && (
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: fillWidth,
                    backgroundColor: progressColor,
                  },
                ]}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [topics, setTopics] = useState(TOPICS);
  const [userData, setUserData] = useState(getDefaultUser());
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | undefined>(undefined);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editPhotoUri, setEditPhotoUri] = useState<string | undefined>(undefined);
  const [savingProfile, setSavingProfile] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        try {
          const saved = await getTopicProgress();
          if (cancelled) return;
          if (saved && typeof saved === 'object') {
            setTopics((prev) => prev.map((t) => ({ ...t, progress: (saved as Record<number, number>)[t.id] ?? 0 })));
          }
          const overlay = await getProfileOverlay();
          if (cancelled) return;
          const user = await database.getUserData();
          if (cancelled) return;
          const displayName = (overlay.displayName?.trim() || user?.username || user?.displayName) ?? '';
          if (user) {
            const isLocalEmail = !!(user.email && user.email.startsWith('_local_') && user.email.endsWith('@app'));
            setUserData({
              name: (displayName || user.username) ?? '',
              email: isLocalEmail ? '' : (user.email ?? ''),
              memberSince: user.createdAt ?? '',
              avatar: ((displayName || user.username) ?? '').charAt(0).toUpperCase() || '?',
            });
            if (isWeb() && user.photoUrl) {
              setProfilePhotoUri(user.photoUrl);
            } else {
              setProfilePhotoUri(overlay.photoUri);
            }
          } else {
            setUserData(getDefaultUser());
            setProfilePhotoUri(overlay.photoUri);
          }
        } catch (e) {
          if (!cancelled) {
            setUserData(getDefaultUser());
            setProfilePhotoUri(undefined);
          }
        }
      };
      load();
      return () => { cancelled = true; };
    }, [])
  );
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start visible
  const slideAnim = useRef(new Animated.Value(20)).current; // Start slightly down for smooth slide
  const avatarScale = useRef(new Animated.Value(0.9)).current; // Start slightly smaller for bounce

  const handleEditProfile = () => {
    setEditDisplayName(userData.name || '');
    setEditPhotoUri(profilePhotoUri);
    setEditModalVisible(true);
  };

  const handlePickImage = async () => {
    try {
      // Load picker only when user taps (avoids native module load on profile open; can crash on some Android 14 devices)
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        if (isWeb()) return;
        Alert.alert('Permission needed', 'Allow access to your photos to set a profile picture.');
        return;
      }
      // On native, avoid base64 to prevent large data URIs that can crash or OOM on Android
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images ?? ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: isWeb(),
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const uri = isWeb() && asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        if (uri) setEditPhotoUri(uri);
      }
    } catch (e) {
      console.warn('Image picker error:', e);
      if (!isWeb()) Alert.alert('Error', 'Could not open image picker. Try again or use a different photo.');
    }
  };

  const handleSaveProfile = async () => {
    const name = editDisplayName.trim();
    setSavingProfile(true);
    try {
      let photoUriToSave: string | undefined = editPhotoUri;
      if (isWeb() && typeof database.updateUserProfile === 'function') {
        if (editPhotoUri?.startsWith('data:')) {
          const { uploadImageToCloudinary } = await import('../../utils/cloudinaryUpload');
          const { secure_url } = await uploadImageToCloudinary(editPhotoUri);
          photoUriToSave = secure_url;
        }
        await database.updateUserProfile({
          displayName: name || undefined,
          photoUrl: photoUriToSave,
        });
      }
      await setProfileOverlay({ displayName: name || undefined, photoUri: photoUriToSave });
      setProfilePhotoUri(photoUriToSave);
      setUserData((prev) => ({
        ...prev,
        name: name || prev.name,
        avatar: (name || userData.name || '').charAt(0).toUpperCase() || '?',
      }));
      setEditModalVisible(false);
    } catch (e) {
      console.warn('Save profile failed:', e);
      if (isWeb() && typeof window !== 'undefined' && window.alert) {
        window.alert('Failed to save profile. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
  };

  const handleTopicPress = (topicId: number) => {
    console.log('Navigate to topic:', topicId);
    // TODO: Navigate to topic detail screen
  };

  const handleResetProgress = () => {
    setResetModalVisible(true);
  };

  const confirmResetProgress = async () => {
    setResetModalVisible(false);
    await resetTopicProgress();
    setTopics((prev) => prev.map((t) => ({ ...t, progress: 0 })));
    Alert.alert('Success', 'Your progress has been reset.');
  };

  const performLogout = async () => {
    try {
      await database.signOut();
    } catch {
      // continue to login screen
    }
    router.replace('/auth/login');
  };

  const handleLogout = () => {
    if (isWeb() && typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Are you sure you want to logout?')) {
        performLogout();
      }
      return;
    }
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: performLogout },
      ],
      { cancelable: true }
    );
  };

  const avatarPulse = useRef(new Animated.Value(1)).current;
  const avatarGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth entrance animations (content already visible, just animate movement)
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(avatarScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Avatar pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulse, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(avatarPulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Avatar glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarGlow, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(avatarGlow, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString || typeof dateString !== 'string' || !dateString.trim()) return '—';
    try {
      const date = new Date(dateString.trim());
      if (Number.isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '—';
    }
  };

  const avatarGlowOpacity = avatarGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <View style={styles.container}>
      <TabsAnimatedBackground />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isWeb() && styles.scrollContentWeb]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.scrollInner, isWeb() && styles.scrollInnerWeb]}>
        {/* User Profile Header with Gradient */}
        <Animated.View 
          style={[
            styles.profileHeader,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[ProfessionalColors.primary + '15', ProfessionalColors.white, ProfessionalColors.white]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>

          <View style={styles.avatarContainer}>
            {/* Outer view for shadow animation (non-native driver) */}
            <Animated.View
              style={[
                styles.avatar,
                {
                  shadowOpacity: avatarGlowOpacity,
                },
              ]}
            >
              {/* Inner view for transform animation (native driver) */}
              <Animated.View
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: [
                    { scale: Animated.multiply(avatarScale, avatarPulse) },
                  ],
                }}
              >
                {profilePhotoUri && (profilePhotoUri.startsWith('http') || profilePhotoUri.startsWith('data:') || profilePhotoUri.startsWith('file:')) ? (
                  <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
                ) : (
                  <>
                    <LinearGradient
                      colors={[ProfessionalColors.primary, ProfessionalColors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.avatarText}>{userData.avatar || '?'}</Text>
                  </>
                )}
              </Animated.View>
            </Animated.View>
          </View>

          <Text style={styles.userName}>{userData.name || '—'}</Text>
          <Text style={styles.userEmail}>{userData.email || '—'}</Text>
          <Text style={styles.memberSince}>
            {userData.memberSince ? `Member since ${formatDate(userData.memberSince)}` : '—'}
          </Text>
        </Animated.View>

        {/* Statistics Overview */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <AnimatedStatCard
              icon="📚"
              value={`${DEFAULT_STATS.topicsMastered}/${DEFAULT_STATS.totalTopics}`}
              label="Topics Mastered"
              index={0}
              delay={100}
            />
            <AnimatedStatCard
              icon="📊"
              value={`${DEFAULT_STATS.averageScore}%`}
              label="Average Score"
              index={1}
              delay={150}
            />
            <AnimatedStatCard
              icon="✅"
              value={DEFAULT_STATS.quizzesCompleted}
              label="Quizzes Completed"
              index={2}
              delay={200}
            />
            <AnimatedStatCard
              icon="🔥"
              value={DEFAULT_STATS.currentStreak}
              label="Day Streak"
              index={3}
              delay={250}
            />
            <AnimatedStatCard
              icon="⏱️"
              value={`${DEFAULT_STATS.learningTime}h`}
              label="Learning Time"
              index={4}
              delay={300}
            />
            <AnimatedStatCard
              icon="🏆"
              value={DEFAULT_STATS.achievementPoints}
              label="Achievement Points"
              index={5}
              delay={350}
            />
          </View>
        </Animated.View>

        {/* Detailed Progress Section */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressContainer}>
            {topics.map((topic, index) => (
              <AnimatedProgressItem
                key={topic.id}
                topic={topic}
                index={index}
                onPress={handleTopicPress}
              />
            ))}
          </View>
        </Animated.View>

        {/* Settings & Actions */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Settings & Actions</Text>
          <View style={styles.actionsContainer}>
            <AnimatedActionItem
              icon="🔄"
              text="Reset Progress"
              textColor={ProfessionalColors.error}
              onPress={handleResetProgress}
              index={0}
              delay={400}
            />
          </View>
        </Animated.View>

        {/* Logout Button */}
        <AnimatedLogoutButton
          onPress={handleLogout}
          fadeAnim={fadeAnim}
        />
        </View>
      </ScrollView>

      {/* Reset Progress Confirmation Modal */}
      <Modal
        visible={resetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Progress</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to reset all your progress? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setResetModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmResetProgress}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonConfirmText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.editModalContent]}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.editModalInput}
              placeholder="Display name"
              placeholderTextColor={ProfessionalColors.textSecondary}
              value={editDisplayName}
              onChangeText={setEditDisplayName}
              autoCapitalize="words"
            />
            <View style={styles.editModalPhotoRow}>
              <View style={styles.editModalPhotoPreview}>
                {editPhotoUri && (editPhotoUri.startsWith('http') || editPhotoUri.startsWith('data:') || editPhotoUri.startsWith('file:')) ? (
                  <Image source={{ uri: editPhotoUri }} style={styles.editModalPhotoImage} />
                ) : (
                  <Text style={styles.editModalPhotoPlaceholder}>{userData.avatar || '?'}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.editModalPhotoButton}
                onPress={handlePickImage}
                activeOpacity={0.7}
              >
                <Text style={styles.editModalPhotoButtonText}>Select profile picture</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={handleCloseEditModal}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, savingProfile && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonConfirmText}>{savingProfile ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </View>
  );
}

// Compute responsive values before StyleSheet
const PROFILE_WEB_MAX_WIDTH = 960;
const responsiveValues = {
  paddingH: isWeb() ? 32 : isTablet() ? wp(5) : wp(4),
  editButtonSize: isWeb() ? 44 : isTablet() ? 48 : isSmallDevice() ? 36 : 40,
  editButtonRadius: isWeb() ? 22 : isTablet() ? 24 : isSmallDevice() ? 18 : 20,
  editIconFont: isWeb() ? 22 : isTablet() ? 24 : isSmallDevice() ? 18 : 20,
  avatarSize: isWeb() ? 100 : isTablet() ? 120 : isSmallDevice() ? 80 : 100,
  avatarRadius: isWeb() ? 50 : isTablet() ? 60 : isSmallDevice() ? 40 : 50,
  avatarTextFont: isWeb() ? 36 : isTablet() ? 44 : isSmallDevice() ? 28 : 36,
  userNameFont: isWeb() ? 26 : isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  userEmailFont: isWeb() ? 15 : isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  memberSinceFont: isWeb() ? 13 : isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  sectionTitleFont: isWeb() ? 22 : isTablet() ? 24 : isSmallDevice() ? 18 : 20,
  statCardWidth: isWeb() ? (PROFILE_WEB_MAX_WIDTH - 20 * 2) / 3 : isTablet() ? scaleSize(180) : isSmallDevice() ? scaleSize(140) : scaleSize(160),
  statCardHeight: isWeb() ? 130 : isTablet() ? scaleSize(140) : isSmallDevice() ? scaleSize(120) : scaleSize(130),
  statIconFont: isWeb() ? 36 : isTablet() ? 40 : isSmallDevice() ? 28 : 32,
  statValueFont: isWeb() ? 26 : isTablet() ? 30 : isSmallDevice() ? 20 : 24,
  statLabelFont: isWeb() ? 13 : isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  topicIconFont: isWeb() ? 24 : isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  topicNameFont: isWeb() ? 17 : isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  progressPercentageFont: isWeb() ? 16 : isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  progressBarHeight: isWeb() ? 10 : isTablet() ? 10 : isSmallDevice() ? 6 : 8,
  actionIconFont: isWeb() ? 24 : isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  actionTextFont: isWeb() ? 17 : isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  actionArrowFont: isWeb() ? 24 : isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  logoutButtonFont: isWeb() ? 17 : isTablet() ? 20 : isSmallDevice() ? 16 : 18,
  modalMaxWidth: isWeb() ? 440 : isTablet() ? 500 : 400,
  modalTitleFont: isWeb() ? 22 : isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  modalMessageFont: isWeb() ? 16 : isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  modalButtonTextFont: isWeb() ? 16 : isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  cardMaxWidth: isWeb() ? PROFILE_WEB_MAX_WIDTH : isTablet() ? 800 : undefined,
  logoutButtonMaxWidth: isWeb() ? 400 : undefined,
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
    paddingTop: getSpacing(Spacing.md),
    paddingBottom: getSpacing(Spacing.xxl) + 80,
    paddingHorizontal: isWeb() ? 0 : 0,
  },
  scrollContentWeb: {
    paddingHorizontal: getSpacing(Spacing.lg),
    alignItems: 'center',
  },
  scrollInner: {
    width: '100%',
  },
  scrollInnerWeb: {
    maxWidth: PROFILE_WEB_MAX_WIDTH,
    alignSelf: 'center',
  },
  // Profile Header
  profileHeader: {
    backgroundColor: ProfessionalColors.white,
    padding: getSpacing(Spacing.xl),
    paddingTop: isWeb() ? getSpacing(Spacing.xxl) + getSpacing(Spacing.md) : getSpacing(Spacing.xxl),
    paddingBottom: isWeb() ? getSpacing(Spacing.xl) + getSpacing(Spacing.md) : getSpacing(Spacing.xl),
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: ProfessionalColors.border,
    overflow: 'hidden',
    borderTopLeftRadius: isWeb() ? scaleSize(BorderRadius.xl) : 0,
    borderTopRightRadius: isWeb() ? scaleSize(BorderRadius.xl) : 0,
  },
  editButton: {
    position: 'absolute',
    top: getSpacing(Spacing.lg),
    right: getSpacing(Spacing.lg),
    width: scaleSize(responsiveValues.editButtonSize),
    height: scaleSize(responsiveValues.editButtonSize),
    borderRadius: scaleSize(responsiveValues.editButtonRadius),
    backgroundColor: ProfessionalColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: scaleFont(responsiveValues.editIconFont),
  },
  avatarContainer: {
    marginBottom: getSpacing(Spacing.md),
  },
  avatar: {
    width: scaleSize(responsiveValues.avatarSize),
    height: scaleSize(responsiveValues.avatarSize),
    borderRadius: scaleSize(responsiveValues.avatarRadius),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: scaleSize(8) },
    shadowOpacity: 0.5,
    shadowRadius: scaleSize(16),
    elevation: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: scaleSize(responsiveValues.avatarRadius),
  },
  avatarText: {
    fontSize: scaleFont(responsiveValues.avatarTextFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
    textAlign: 'center',
    alignSelf: 'center',
  },
  userName: {
    fontSize: scaleFont(responsiveValues.userNameFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  userEmail: {
    fontSize: scaleFont(responsiveValues.userEmailFont),
    color: ProfessionalColors.textSecondary,
    marginBottom: getSpacing(Spacing.xs),
  },
  memberSince: {
    fontSize: scaleFont(responsiveValues.memberSinceFont),
    color: ProfessionalColors.textSecondary,
  },
  // Section
  section: {
    marginTop: isWeb() ? getSpacing(Spacing.xl) : getSpacing(Spacing.lg),
    paddingHorizontal: isWeb() ? 0 : responsiveValues.paddingH,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: scaleFont(responsiveValues.sectionTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: isWeb() ? getSpacing(Spacing.lg) : getSpacing(Spacing.md),
  },
  // Statistics Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isWeb() ? getSpacing(Spacing.md) : getSpacing(Spacing.md),
    justifyContent: isWeb() ? 'space-between' : isSmallDevice() ? 'center' : 'flex-start',
  },
  statCard: {
    width: responsiveValues.statCardWidth,
    height: responsiveValues.statCardHeight,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.md),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.25,
    shadowRadius: scaleSize(12),
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  statIcon: {
    fontSize: scaleFont(responsiveValues.statIconFont),
    marginBottom: getSpacing(Spacing.sm),
  },
  statValue: {
    fontSize: scaleFont(responsiveValues.statValueFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
    marginBottom: getSpacing(Spacing.xs),
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: scaleFont(responsiveValues.statLabelFont),
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Progress Section
  progressContainer: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: isWeb() ? getSpacing(Spacing.lg) : getSpacing(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: isWeb() ? 0.06 : 0.1,
    shadowRadius: scaleSize(isWeb() ? 12 : 8),
    elevation: 4,
    borderWidth: isWeb() ? 1 : 0,
    borderColor: isWeb() ? ProfessionalColors.border : 'transparent',
  },
  progressItem: {
    marginBottom: getSpacing(Spacing.lg),
  },
  progressItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.sm),
    flexWrap: isSmallDevice() ? 'wrap' : 'nowrap',
  },
  progressItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginBottom: isSmallDevice() ? getSpacing(Spacing.xs) : 0,
  },
  topicIcon: {
    fontSize: scaleFont(responsiveValues.topicIconFont),
    marginRight: getSpacing(Spacing.sm),
  },
  topicName: {
    fontSize: scaleFont(responsiveValues.topicNameFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
    flex: 1,
  },
  progressPercentage: {
    fontSize: scaleFont(responsiveValues.progressPercentageFont),
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginTop: getSpacing(Spacing.xs),
  },
  progressBarBackground: {
    height: scaleSize(responsiveValues.progressBarHeight),
    backgroundColor: ProfessionalColors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  // Actions
  actionsContainer: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: isWeb() ? 0.06 : 0.1,
    shadowRadius: scaleSize(isWeb() ? 12 : 8),
    elevation: 4,
    borderWidth: isWeb() ? 1 : 0,
    borderColor: isWeb() ? ProfessionalColors.border : 'transparent',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.lg),
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: scaleFont(responsiveValues.actionIconFont),
    marginRight: getSpacing(Spacing.md),
  },
  actionText: {
    fontSize: scaleFont(responsiveValues.actionTextFont),
    fontWeight: '500',
    color: ProfessionalColors.text,
  },
  actionArrow: {
    fontSize: scaleFont(responsiveValues.actionArrowFont),
    color: ProfessionalColors.textSecondary,
  },
  actionDivider: {
    height: 1,
    backgroundColor: ProfessionalColors.border,
    marginLeft: getSpacing(Spacing.xl) + getSpacing(Spacing.md),
  },
  // Logout Button
  logoutButton: {
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.md),
    alignItems: 'center',
    shadowColor: ProfessionalColors.error,
    shadowOffset: { width: 0, height: scaleSize(6) },
    shadowOpacity: 0.5,
    shadowRadius: scaleSize(12),
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  logoutButtonText: {
    fontSize: scaleFont(responsiveValues.logoutButtonFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
    position: 'relative',
    zIndex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing(Spacing.lg),
  },
  modalContent: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.xl),
    padding: getSpacing(Spacing.xl),
    width: '100%',
    maxWidth: scaleSize(responsiveValues.modalMaxWidth),
  },
  editModalContent: {
    maxWidth: scaleSize(400),
  },
  editModalInput: {
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
    borderRadius: scaleSize(BorderRadius.md),
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    fontSize: scaleFont(16),
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.lg),
  },
  editModalPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.xl),
    gap: getSpacing(Spacing.md),
  },
  editModalPhotoPreview: {
    width: scaleSize(80),
    height: scaleSize(80),
    borderRadius: scaleSize(40),
    backgroundColor: ProfessionalColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  editModalPhotoImage: {
    width: '100%',
    height: '100%',
  },
  editModalPhotoPlaceholder: {
    fontSize: scaleFont(32),
    fontWeight: 'bold',
    color: ProfessionalColors.textSecondary,
  },
  editModalPhotoButton: {
    flex: 1,
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.md),
    backgroundColor: ProfessionalColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalPhotoButtonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: ProfessionalColors.white,
  },
  modalTitle: {
    fontSize: scaleFont(responsiveValues.modalTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.md),
  },
  modalMessage: {
    fontSize: scaleFont(responsiveValues.modalMessageFont),
    color: ProfessionalColors.textSecondary,
    lineHeight: scaleSize(24),
    marginBottom: getSpacing(Spacing.xl),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: getSpacing(Spacing.md),
    flexWrap: isSmallDevice() ? 'wrap' : 'nowrap',
  },
  modalButton: {
    flex: 1,
    padding: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.md),
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: ProfessionalColors.background,
  },
  modalButtonCancelText: {
    fontSize: scaleFont(responsiveValues.modalButtonTextFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  modalButtonConfirm: {
    backgroundColor: ProfessionalColors.error,
  },
  modalButtonConfirmText: {
    fontSize: scaleFont(responsiveValues.modalButtonTextFont),
    fontWeight: '600',
    color: ProfessionalColors.white,
  },
});
