import { Stack } from 'expo-router';
import React from 'react';
import ResponsiveScreenWrapper from '../components/ResponsiveScreenWrapper';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary';

export default function RootLayout() {
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
