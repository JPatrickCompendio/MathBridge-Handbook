import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Modal,
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
  success: '#059669',
};

const MATH_SYMBOLS = ['+', '−', '×', '÷', 'Σ', 'π', '√', '='];

// Floating symbols for background (extended set for variety)
const BG_SYMBOLS = ['+', '−', '×', '÷', 'π', '√', 'Σ', '∫', '∞', 'θ', 'α', '='];

// Single floating symbol with drift animation
function FloatingMathSymbol({
  symbol,
  left,
  top,
  size,
  opacity,
  delay,
  duration,
}: {
  symbol: string;
  left: number;
  top: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const driftY = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );
    const driftX = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 1,
          duration: duration * 0.7,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: duration * 0.7,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );
    const spin = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: duration * 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      { iterations: -1 }
    );
    const timer = setTimeout(() => {
      driftY.start();
      driftX.start();
      spin.start();
    }, delay);
    return () => {
      clearTimeout(timer);
      driftY.stop();
      driftX.stop();
      spin.stop();
    };
  }, [delay, duration, rotate, translateX, translateY]);

  const moveY = translateY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });
  const moveX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });
  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: `${left}%`,
          top: `${top}%`,
          transform: [{ translateX: moveX }, { translateY: moveY }, { rotate: rotation }],
        },
      ]}
    >
      <Text style={{ fontSize: size, color: ProfessionalColors.primary, opacity, fontWeight: '600' }}>
        {symbol}
      </Text>
    </Animated.View>
  );
}

// Animated math background layer (faster on web)
function MathBackground() {
  const speedFactor = isWeb() ? 0.25 : 1;
  const symbols = [
    { symbol: BG_SYMBOLS[0], left: 8, top: 12, size: 48, opacity: 0.48, delay: 0, duration: 18000 },
    { symbol: BG_SYMBOLS[1], left: 82, top: 18, size: 36, opacity: 0.42, delay: 800, duration: 22000 },
    { symbol: BG_SYMBOLS[2], left: 15, top: 55, size: 56, opacity: 0.45, delay: 400, duration: 20000 },
    { symbol: BG_SYMBOLS[3], left: 78, top: 48, size: 42, opacity: 0.44, delay: 1200, duration: 24000 },
    { symbol: BG_SYMBOLS[4], left: 72, top: 72, size: 52, opacity: 0.46, delay: 600, duration: 19000 },
    { symbol: BG_SYMBOLS[5], left: 6, top: 78, size: 44, opacity: 0.43, delay: 1000, duration: 21000 },
    { symbol: BG_SYMBOLS[6], left: 88, top: 35, size: 38, opacity: 0.4, delay: 200, duration: 26000 },
    { symbol: BG_SYMBOLS[7], left: 42, top: 8, size: 40, opacity: 0.44, delay: 1500, duration: 23000 },
    { symbol: BG_SYMBOLS[8], left: 50, top: 65, size: 46, opacity: 0.42, delay: 300, duration: 25000 },
    { symbol: BG_SYMBOLS[9], left: 28, top: 85, size: 34, opacity: 0.45, delay: 500, duration: 20000 },
  ];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {symbols.map((s, i) => (
        <FloatingMathSymbol
          key={i}
          symbol={s.symbol}
          left={s.left}
          top={s.top}
          size={scaleSize(s.size)}
          opacity={s.opacity}
          delay={s.delay}
          duration={Math.round(s.duration * speedFactor)}
        />
      ))}
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ verify?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [currentSymbolIndex, setCurrentSymbolIndex] = useState(0);

  // App-only: reset password with recovery PIN modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPin, setResetPin] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Animation values for 3D rotation
  const rotateYAnim = useRef(new Animated.Value(0)).current;
  const rotateXAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const symbolInterval = setInterval(() => {
      setCurrentSymbolIndex((prevIndex) =>
        (prevIndex + 1) % MATH_SYMBOLS.length
      );
    }, 2000);

    const animateMathSymbol = () => {
      Animated.parallel([
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
      ]).start(() => animateMathSymbol());
    };

    animateMathSymbol();

    return () => {
      clearInterval(symbolInterval);
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
      newErrors.email = isWeb() ? 'Email is required' : 'Username is required';
    } else if (isWeb() && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setLoginError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const session = await database.loginUser(email.trim(), password);
      if (session) {
        const welcomeParam = `welcome=back&username=${encodeURIComponent(session.username || email.trim())}`;
        router.replace(`/tabs?${welcomeParam}` as Href);
      } else {
        setLoginError('Invalid email or password. Create an account if you don\'t have one.');
      }
    } catch (e) {
      const msg = e instanceof Error && e.message === 'EMAIL_NOT_VERIFIED'
        ? 'Please verify your email before signing in. Check your inbox (and spam folder) for the verification link.'
        : 'Something went wrong. Please try again.';
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotPasswordMessage(null);
    setLoginError('');
    if (isWeb()) {
      if (!email.trim()) {
        setErrors((e) => ({ ...e, email: 'Enter your email to receive a reset link' }));
        return;
      }
      setResettingPassword(true);
      try {
        await database.sendPasswordResetEmail(email.trim());
        setForgotPasswordMessage({ type: 'success', text: 'Check your email for a link to reset your password.' });
      } catch (e: unknown) {
        const msg = e && typeof e === 'object' && 'code' in e
          ? (e as { code: string }).code === 'auth/user-not-found'
            ? 'No account found for this email.'
            : (e as { message?: string }).message ?? 'Something went wrong. Please try again.'
          : 'Something went wrong. Please try again.';
        setForgotPasswordMessage({ type: 'error', text: msg });
      } finally {
        setResettingPassword(false);
      }
      return;
    }
    // App: open reset-with-PIN modal
    setResetEmail(email.trim());
    setResetPin('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetError('');
    setResetSuccess(false);
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetError('');
    setResetSuccess(false);
  };

  const handleResetPasswordSubmit = async () => {
    setResetError('');
    if (!resetEmail.trim()) {
      setResetError('Enter your username.');
      return;
    }
    if (!/^\d{4,6}$/.test(resetPin)) {
      setResetError('Recovery PIN must be 4–6 digits.');
      return;
    }
    if (resetNewPassword.length < 6) {
      setResetError('New password must be at least 6 characters.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    setResetLoading(true);
    try {
      await database.resetPasswordWithPin(resetEmail.trim(), resetPin, resetNewPassword);
      setResetSuccess(true);
    } catch (e: unknown) {
      setResetError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundWrap}>
        <MathBackground />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {isWeb() ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, styles.scrollContentWeb]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.webLoginContainer}>
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
          <View style={styles.formArea}>
            <View style={styles.form}>
              {isWeb() && params.verify === '1' ? (
                <Text style={styles.verifyEmailSentText}>
                  Verification email sent. Sign in after you verify your email.
                </Text>
              ) : null}
              <Input
                label={isWeb() ? 'Email Address' : 'Username'}
                placeholder={isWeb() ? 'Enter your email' : 'Your username'}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                keyboardType={isWeb() ? 'email-address' : 'default'}
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
                disabled={resettingPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  {resettingPassword ? 'Sending…' : 'Forgot your password?'}
                </Text>
              </TouchableOpacity>

              {forgotPasswordMessage ? (
                <Text style={[
                  styles.forgotPasswordMessage,
                  forgotPasswordMessage.type === 'success' ? styles.forgotPasswordMessageSuccess : styles.forgotPasswordMessageError,
                ]}>
                  {forgotPasswordMessage.text}
                </Text>
              ) : null}

              {loginError ? (
                <Text style={styles.loginErrorText}>{loginError}</Text>
              ) : null}

              <Button
                title={loading ? 'Signing in...' : 'Sign In'}
                onPress={handleLogin}
                variant="primary"
                size="large"
                style={styles.signInButton}
                disabled={loading}
              />
              {loading ? (
                <ActivityIndicator size="small" color={ProfessionalColors.primary} style={styles.loader} />
              ) : null}

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
          </View>
        </ScrollView>
        ) : (
          <View style={styles.contentNoScroll} pointerEvents="box-none">
            <View style={[styles.header, styles.headerCompact]}>
              <View style={[styles.logoContainer, styles.logoCompact]}>
                <Animated.View
                  style={[
                    styles.mathContainer,
                    styles.mathCompact,
                    {
                      transform: [
                        { rotateY: rotateY },
                        { rotateX: rotateX },
                        { scale: scaleAnim },
                        { perspective: 1000 },
                      ],
                    },
                  ]}
                >
                  <View style={[styles.mathSymbol, styles.mathSymbolCompact]}>
                    <Text style={[styles.symbolText, styles.symbolTextCompact]}>
                      {MATH_SYMBOLS[currentSymbolIndex]}
                    </Text>
                  </View>
                </Animated.View>
              </View>
              <Text style={[styles.title, styles.titleCompact]}>Welcome Back</Text>
              <Text style={[styles.subtitle, styles.subtitleCompact]}>
                Sign in to access your learning dashboard
              </Text>
            </View>
            <View style={[styles.formArea, styles.formAreaCompact]}>
              <View style={[styles.form, styles.formCompact]}>
                <Input
                  label="Username"
                  placeholder="Your username"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email}
                  containerStyle={[styles.input, styles.inputCompact]}
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
                  containerStyle={[styles.input, styles.inputCompact]}
                />
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={[styles.forgotPassword, styles.forgotPasswordCompact]}
                  disabled={resettingPassword}
                >
                  <Text style={styles.forgotPasswordText}>
                    {resettingPassword ? 'Sending…' : 'Forgot your password?'}
                  </Text>
                </TouchableOpacity>
                {forgotPasswordMessage ? (
                  <Text style={[
                    styles.forgotPasswordMessage,
                    forgotPasswordMessage.type === 'success'
                      ? styles.forgotPasswordMessageSuccess
                      : styles.forgotPasswordMessageError,
                  ]}>
                    {forgotPasswordMessage.text}
                  </Text>
                ) : null}
                {loginError ? (
                  <Text style={styles.loginErrorText}>{loginError}</Text>
                ) : null}
                <Button
                  title={loading ? 'Signing in...' : 'Sign In'}
                  onPress={handleLogin}
                  variant="primary"
                  size="large"
                  style={[styles.signInButton, styles.signInButtonCompact]}
                  disabled={loading}
                />
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={ProfessionalColors.primary}
                    style={styles.loader}
                  />
                ) : null}
                <View style={[styles.signupContainer, styles.signupContainerCompact]}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                    <Text style={styles.signupLinkText}>Create account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {!isWeb() ? (
        <Modal
          visible={showResetModal}
          animationType="slide"
          transparent
          onRequestClose={closeResetModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <Text style={styles.modalTitle}>Reset password</Text>
                <Text style={styles.modalSubtitle}>Enter your username, recovery PIN, and a new password.</Text>
                {resetSuccess ? (
                  <>
                    <Text style={styles.resetSuccessText}>Password updated. Sign in with your new password.</Text>
                    <Button title="Close" onPress={closeResetModal} variant="primary" size="large" style={styles.modalButton} />
                  </>
                ) : (
                  <>
                    <Input
                      label="Username"
                      placeholder="Your username"
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      keyboardType="default"
                      autoCapitalize="none"
                      containerStyle={styles.input}
                    />
                    <Input
                      label="Recovery PIN"
                      placeholder="4–6 digits you set when signing up"
                      value={resetPin}
                      onChangeText={setResetPin}
                      keyboardType="number-pad"
                      maxLength={6}
                      containerStyle={styles.input}
                    />
                    <Input
                      label="New password"
                      placeholder="At least 6 characters"
                      value={resetNewPassword}
                      onChangeText={setResetNewPassword}
                      secureTextEntry
                      containerStyle={styles.input}
                    />
                    <Input
                      label="Confirm new password"
                      placeholder="Re-enter new password"
                      value={resetConfirmPassword}
                      onChangeText={setResetConfirmPassword}
                      secureTextEntry
                      containerStyle={styles.input}
                    />
                    {resetError ? <Text style={styles.resetErrorText}>{resetError}</Text> : null}
                    <Button
                      title={resetLoading ? 'Updating…' : 'Update password'}
                      onPress={handleResetPasswordSubmit}
                      variant="primary"
                      size="large"
                      style={styles.modalButton}
                      disabled={resetLoading}
                    />
                    <TouchableOpacity onPress={closeResetModal} style={styles.modalCancel}>
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
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
  backgroundWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(2),
  },
  scrollContentWeb: {
    paddingHorizontal: wp(8),
  },
  contentNoScroll: {
    flex: 1,
    paddingHorizontal: wp(6),
    justifyContent: 'space-between',
  },
  headerCompact: {
    paddingTop: getSafeAreaTopPadding() + hp(1.5),
    paddingBottom: getSpacing(Spacing.sm),
  },
  logoCompact: {
    marginBottom: getSpacing(Spacing.sm),
  },
  mathCompact: {
    width: scaleSize(72),
    height: scaleSize(72),
  },
  mathSymbolCompact: {
    width: scaleSize(56),
    height: scaleSize(56),
    borderRadius: scaleSize(28),
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowRadius: scaleSize(8),
  },
  symbolTextCompact: {
    fontSize: scaleFont(24),
  },
  titleCompact: {
    fontSize: scaleFont(26),
    marginBottom: getSpacing(Spacing.xs),
  },
  subtitleCompact: {
    fontSize: scaleFont(13),
    lineHeight: scaleFont(18),
  },
  formAreaCompact: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
    paddingTop: getSpacing(Spacing.lg),
    paddingBottom: getSpacing(Spacing.md),
  },
  formCompact: {
    flex: 0,
  },
  inputCompact: {
    marginBottom: getSpacing(Spacing.sm),
  },
  forgotPasswordCompact: {
    marginBottom: getSpacing(Spacing.sm),
    marginTop: getSpacing(Spacing.xs),
  },
  signInButtonCompact: {
    marginBottom: getSpacing(Spacing.sm),
    marginTop: getSpacing(Spacing.xs),
  },
  signupContainerCompact: {
    paddingTop: getSpacing(Spacing.sm),
  },
  webLoginContainer: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
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
  formArea: {
    flex: 1,
    paddingHorizontal: authResponsiveValues.formCardPaddingH,
    paddingTop: getSpacing(Spacing.xxl),
    paddingBottom: getSpacing(Spacing.xl),
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
  forgotPasswordMessage: {
    fontSize: scaleFont(authResponsiveValues.smallTextFont),
    marginBottom: getSpacing(Spacing.md),
    textAlign: 'center',
  },
  forgotPasswordMessageSuccess: {
    color: ProfessionalColors.success,
  },
  forgotPasswordMessageError: {
    color: ProfessionalColors.error,
  },
  verifyEmailSentText: {
    fontSize: scaleFont(authResponsiveValues.smallTextFont),
    color: ProfessionalColors.success,
    marginBottom: getSpacing(Spacing.md),
    textAlign: 'center',
  },
  loginErrorText: {
    fontSize: scaleFont(authResponsiveValues.smallTextFont),
    color: ProfessionalColors.error,
    marginBottom: getSpacing(Spacing.md),
    textAlign: 'center',
  },
  loader: {
    marginTop: getSpacing(Spacing.sm),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing(Spacing.xl),
  },
  modalContent: {
    backgroundColor: ProfessionalColors.card,
    borderRadius: scaleSize(20),
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  modalScrollContent: {
    padding: getSpacing(Spacing.xxl),
    paddingBottom: getSpacing(Spacing.xxl) + getSpacing(Spacing.lg),
  },
  modalTitle: {
    fontSize: scaleFont(authResponsiveValues.titleFont),
    fontWeight: '700',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.sm),
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: scaleFont(authResponsiveValues.smallTextFont),
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
    marginBottom: getSpacing(Spacing.xl),
  },
  resetSuccessText: {
    fontSize: scaleFont(authResponsiveValues.textFont),
    color: ProfessionalColors.success,
    textAlign: 'center',
    marginBottom: getSpacing(Spacing.xl),
  },
  resetErrorText: {
    fontSize: scaleFont(authResponsiveValues.smallTextFont),
    color: ProfessionalColors.error,
    textAlign: 'center',
    marginBottom: getSpacing(Spacing.md),
  },
  modalButton: {
    marginBottom: getSpacing(Spacing.md),
  },
  modalCancel: {
    alignSelf: 'center',
    paddingVertical: getSpacing(Spacing.sm),
  },
  modalCancelText: {
    fontSize: scaleFont(authResponsiveValues.textFont),
    color: ProfessionalColors.textSecondary,
  },
});

