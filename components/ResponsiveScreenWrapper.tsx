import React from 'react';
import { StyleSheet, View } from 'react-native';

type ResponsiveScreenWrapperProps = {
  children: React.ReactNode;
};

/**
 * Wraps screen content. On web we use full viewport width so pages can
 * use their own max-width and grid layouts (website-style). Mobile unchanged.
 */
export default function ResponsiveScreenWrapper({
  children,
}: ResponsiveScreenWrapperProps) {
  return <View style={styles.flex}>{children}</View>;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
