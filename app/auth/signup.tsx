import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Spacing } from '../../constants/colors';
import { database } from '../../services/database';
import { getSafeAreaTopPadding, getSpacing, hp, isSmallDevice, isTablet, isWeb, scaleFont, scaleSize, wp } from '../../utils/responsive';

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
};

const MATH_SYMBOLS = ['+', '−', '×', '÷', 'Σ', 'π', '√', '='];

export default function SignupScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    recoveryPin: '',
    confirmRecoveryPin: '',
  });
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    recoveryPin?: string;
    confirmRecoveryPin?: string;
  }>({});
  const [signupError, setSignupError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSymbolIndex, setCurrentSymbolIndex] = useState(0);

  // Animation values for 3D rotation
  const rotateYAnim = useRef(new Animated.Value(0)).current;
  const rotateXAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Change symbols every 2 seconds
    const symbolInterval = setInterval(() => {
      setCurrentSymbolIndex((prevIndex) => 
        (prevIndex + 1) % MATH_SYMBOLS.length
      );
    }, 2000);

    // Continuous 3D rotation animation
    const animateMathSymbol = () => {
      Animated.parallel([
        // Y-axis rotation (3D flip)
        Animated.sequence([
          Animated.timing(rotateYAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(rotateYAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
        // X-axis rotation
        Animated.sequence([
          Animated.timing(rotateXAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(rotateXAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
        // Scale pulse
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateMathSymbol()); // Loop animation
    };

    animateMathSymbol();

    return () => {
      if (symbolInterval) {
        clearInterval(symbolInterval);
      }
    };
  }, []);

  // 3D rotation interpolations
  const rotateY = rotateYAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateX = rotateXAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (isWeb()) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!isWeb()) {
      const pinRegex = /^\d{4,6}$/;
      if (!formData.recoveryPin.trim()) {
        newErrors.recoveryPin = 'Recovery PIN is required (for password reset offline)';
      } else if (!pinRegex.test(formData.recoveryPin)) {
        newErrors.recoveryPin = 'PIN must be 4–6 digits';
      }
      if (!formData.confirmRecoveryPin.trim()) {
        newErrors.confirmRecoveryPin = 'Confirm your recovery PIN';
      } else if (formData.recoveryPin !== formData.confirmRecoveryPin) {
        newErrors.confirmRecoveryPin = 'PINs do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    setSignupError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const email = isWeb()
        ? formData.email.trim()
        : `_local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}@app`;
      await database.createUser({
        username: formData.username.trim(),
        email,
        password: formData.password,
        ...(!isWeb() && formData.recoveryPin.trim() ? { recoveryPin: formData.recoveryPin.trim() } : {}),
      });
      if (isWeb()) {
        Alert.alert(
          'Verify your email',
          'We sent a verification link to your email address. Please check your inbox to verify your account.',
          [{ text: 'OK', onPress: () => router.replace('/tabs' as never) }]
        );
      } else {
        router.replace('/tabs' as never);
      }
    } catch (e: unknown) {
      const message = e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'auth/email-already-in-use'
        ? 'This email is already in use. Sign in instead.'
        : 'Something went wrong. Please try again.';
      setSignupError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Animated.View 
                style={[
                  styles.mathContainer,
                  { 
                    transform: [
                      { rotateY: rotateY },
                      { rotateX: rotateX },
                      { scale: scaleAnim },
                      { perspective: 1000 }
                    ] 
                  }
                ]}
              >
                <View style={styles.mathSymbol}>
                  <Text style={styles.symbolText}>
                    {MATH_SYMBOLS[currentSymbolIndex]}
                  </Text>
                </View>
              </Animated.View>
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join us and start your learning journey
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <View style={styles.form}>
              {isWeb() ? (
                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(text) => handleFieldChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email}
                  containerStyle={styles.input}
                />
              ) : null}

              <Input
                label="Username"
                placeholder="Choose a username"
                value={formData.username}
                onChangeText={(text) => handleFieldChange('username', text)}
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.username}
                containerStyle={styles.input}
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => handleFieldChange('password', text)}
                secureTextEntry
                error={errors.password}
                containerStyle={styles.input}
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleFieldChange('confirmPassword', text)}
                secureTextEntry
                error={errors.confirmPassword}
                containerStyle={styles.input}
              />

              {!isWeb() ? (
                <>
                  <Input
                    label="Recovery PIN"
                    placeholder="4–6 digits (for password reset offline)"
                    value={formData.recoveryPin}
                    onChangeText={(text) => handleFieldChange('recoveryPin', text)}
                    keyboardType="number-pad"
                    maxLength={6}
                    error={errors.recoveryPin}
                    containerStyle={styles.input}
                  />
                  <Input
                    label="Confirm Recovery PIN"
                    placeholder="Re-enter your PIN"
                    value={formData.confirmRecoveryPin}
                    onChangeText={(text) => handleFieldChange('confirmRecoveryPin', text)}
                    keyboardType="number-pad"
                    maxLength={6}
                    error={errors.confirmRecoveryPin}
                    containerStyle={styles.input}
                  />
                </>
              ) : null}

              {signupError ? (
                <Text style={styles.signupErrorText}>{signupError}</Text>
              ) : null}

              <Button
                title={loading ? 'Creating account...' : 'Create Account'}
                onPress={handleSignup}
                variant="primary"
                size="large"
                style={styles.signUpButton}
                disabled={loading}
              />
              {loading ? (
                <ActivityIndicator size="small" color={ProfessionalColors.primary} style={styles.loader} />
              ) : null}

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/auth/login')}
                >
                  <Text style={styles.loginLinkText}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Compute responsive values (same as login screen)
const authResponsiveValues = {
  headerPaddingTop: hp(isTablet() ? 8 : isSmallDevice() ? 4 : 6),
  headerPaddingH: wp(isTablet() ? 15 : 8),
  formCardPaddingH: wp(isTablet() ? 20 : 8),
  formCardMaxWidth: isTablet() ? 600 : undefined,
  logoSize: isTablet() ? 120 : isSmallDevice() ? 80 : 100,
  symbolSize: isTablet() ? 100 : isSmallDevice() ? 60 : 80,
  symbolRadius: isTablet() ? 50 : isSmallDevice() ? 30 : 40,
  symbolFont: isTablet() ? 40 : isSmallDevice() ? 24 : 32,
  titleFont: isTablet() ? 40 : isSmallDevice() ? 26 : 32,
  subtitleFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  subtitleLineHeight: isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  textFont: isTablet() ? 17 : isSmallDevice() ? 13 : 15,
  smallTextFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProfessionalColors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(2),
  },
  header: {
    alignItems: 'center',
    paddingTop: getSafeAreaTopPadding() + authResponsiveValues.headerPaddingTop,
    paddingBottom: getSpacing(Spacing.xxl),
    paddingHorizontal: authResponsiveValues.headerPaddingH,
    backgroundColor: ProfessionalColors.white,
    maxWidth: authResponsiveValues.formCardMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  logoContainer: {
    marginBottom: getSpacing(Spacing.xl),
    alignItems: 'center',
    justifyContent: 'center',
  },
  mathContainer: {
    width: scaleSize(authResponsiveValues.logoSize),
    height: scaleSize(authResponsiveValues.logoSize),
    alignItems: 'center',
    justifyContent: 'center',
  },
  mathSymbol: {
    width: scaleSize(authResponsiveValues.symbolSize),
    height: scaleSize(authResponsiveValues.symbolSize),
    backgroundColor: ProfessionalColors.primary,
    borderRadius: scaleSize(authResponsiveValues.symbolRadius),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: scaleSize(8) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(12),
    elevation: 8,
  },
  symbolText: {
    fontSize: scaleFont(authResponsiveValues.symbolFont),
    color: ProfessionalColors.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: scaleFont(authResponsiveValues.titleFont),
    fontWeight: '700',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.sm),
    textAlign: 'center',
    letterSpacing: -0.5,
    paddingHorizontal: wp(5),
  },
  subtitle: {
    fontSize: scaleFont(authResponsiveValues.subtitleFont),
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
    lineHeight: scaleFont(authResponsiveValues.subtitleLineHeight),
    fontWeight: '400',
    paddingHorizontal: wp(8),
  },
  formCard: {
    flex: 1,
    backgroundColor: ProfessionalColors.background,
    borderTopLeftRadius: scaleSize(32),
    borderTopRightRadius: scaleSize(32),
    paddingHorizontal: authResponsiveValues.formCardPaddingH,
    paddingTop: getSpacing(Spacing.xxl),
    paddingBottom: getSpacing(Spacing.xl),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: authResponsiveValues.formCardMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: getSpacing(Spacing.lg),
  },
  signupErrorText: {
    fontSize: scaleFont(authResponsiveValues.smallTextFont),
    color: ProfessionalColors.error,
    marginBottom: getSpacing(Spacing.md),
    textAlign: 'center',
  },
  loader: {
    marginTop: getSpacing(Spacing.sm),
  },
  signUpButton: {
    marginBottom: getSpacing(Spacing.lg),
    backgroundColor: ProfessionalColors.primary,
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: getSpacing(Spacing.xl),
    flexWrap: 'wrap',
    paddingHorizontal: wp(2),
  },
  loginText: {
    fontSize: scaleFont(authResponsiveValues.textFont),
    color: ProfessionalColors.textSecondary,
    fontWeight: '400',
  },
  loginLinkText: {
    fontSize: scaleFont(authResponsiveValues.textFont),
    color: ProfessionalColors.primary,
    fontWeight: '600',
  },
});

