import { Stack } from 'expo-router';
import React from 'react';
import ResponsiveScreenWrapper from '../components/ResponsiveScreenWrapper';

export default function RootLayout() {
  return (
    <ResponsiveScreenWrapper>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </ResponsiveScreenWrapper>
  );
}
