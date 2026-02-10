import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import ResponsiveScreenWrapper from '../components/ResponsiveScreenWrapper';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary';

/**
 * Registers global error/rejection handlers to log failures and reduce random crashes.
 * Does not swallow errors; improves diagnostics and avoids unhandled rejections where possible.
 */
function useStabilityHandlers() {
  useEffect(() => {
    const ErrorUtils = (global as any).ErrorUtils;
    if (ErrorUtils?.setGlobalHandler) {
      const previous = ErrorUtils.getGlobalHandler?.();
      ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
        console.warn('[App] Unhandled error', isFatal ? '(fatal)' : '', error);
        if (typeof previous === 'function') previous(error, isFatal);
      });
      return () => {
        if (typeof previous === 'function') ErrorUtils.setGlobalHandler(previous);
      };
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      console.warn('[App] Unhandled promise rejection', e.reason);
    };
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', onUnhandledRejection);
  }, []);
}

export default function RootLayout() {
  useStabilityHandlers();
  return (
    <ResponsiveScreenWrapper>
      <GlobalErrorBoundary>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </GlobalErrorBoundary>
    </ResponsiveScreenWrapper>
  );
}
