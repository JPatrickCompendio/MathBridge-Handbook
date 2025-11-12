import { Href, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
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
import { getSafeAreaTopPadding, getSpacing, hp, isSmallDevice, isTablet, scaleFont, scaleSize, wp } from '../../utils/responsive';

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
  success: '#059669',
};

const MATH_SYMBOLS = ['+', '−', '×', '÷', 'Σ', 'π', '√', '='];

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
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

    // Continuous 3D rotation animation (original effect)
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

  // 3D rotation interpolations (original effect)
  const rotateY = rotateYAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateX = rotateXAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validateForm()) {
      // TODO: Implement actual login logic with backend
      console.log('Login:', { email, password });
      // Navigate to homepage after successful login
      router.replace('/tabs' as Href);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password');
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

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to access your learning dashboard
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <View style={styles.form}>
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
                containerStyle={styles.input}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry
                error={errors.password}
                containerStyle={styles.input}
              />

              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                variant="primary"
                size="large"
                style={styles.signInButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Continue with Google"
                onPress={handleGoogleLogin}
                variant="outline"
                size="large"
                style={styles.googleButton}
              />

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/auth/signup')}
                >
                  <Text style={styles.signupLinkText}>Create account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Compute responsive values
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: getSpacing(Spacing.xl),
    marginTop: getSpacing(Spacing.sm),
  },
  forgotPasswordText: {
    fontSize: scaleFont(authResponsiveValues.smallTextFont),
    color: ProfessionalColors.primary,
    fontWeight: '600',
  },
  signInButton: {
    marginBottom: getSpacing(Spacing.lg),
    backgroundColor: ProfessionalColors.primary,
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: getSpacing(Spacing.lg),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: ProfessionalColors.border,
  },
  dividerText: {
    marginHorizontal: getSpacing(Spacing.md),
    fontSize: scaleFont(authResponsiveValues.smallTextFont),
    color: ProfessionalColors.textSecondary,
    fontWeight: '500',
  },
  googleButton: {
    marginBottom: getSpacing(Spacing.xl),
    borderColor: ProfessionalColors.border,
    backgroundColor: ProfessionalColors.white,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: getSpacing(Spacing.xl),
    flexWrap: 'wrap',
    paddingHorizontal: wp(2),
  },
  signupText: {
    fontSize: scaleFont(authResponsiveValues.textFont),
    color: ProfessionalColors.textSecondary,
    fontWeight: '400',
  },
  signupLinkText: {
    fontSize: scaleFont(authResponsiveValues.textFont),
    color: ProfessionalColors.primary,
    fontWeight: '600',
  },
});

