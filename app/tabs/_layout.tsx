import { Tabs } from 'expo-router';
import React from 'react';
import { Animated, Platform, StyleSheet, Text } from 'react-native';
import { BorderRadius } from '../../constants/colors';
import { getSpacing, isSmallDevice, isTablet, scaleFont, scaleSize } from '../../utils/responsive';

const ProfessionalColors = {
  primary: '#FF6600',
  primaryDark: '#CC5200',
  white: '#FFFFFF',
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E5E5E5',
  activeBackground: 'rgba(255, 102, 0, 0.12)',
};

// Enhanced Tab Icon Component with active state indicator
function TabIcon({ 
  emoji, 
  focused, 
  label 
}: { 
  emoji: string; 
  focused: boolean; 
  label: string;
}) {
  const scaleAnim = React.useRef(new Animated.Value(focused ? 1.05 : 1)).current;
  const opacityAnim = React.useRef(new Animated.Value(focused ? 1 : 0.6)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        tension: 200,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const iconSize = isTablet() ? 26 : isSmallDevice() ? 22 : 24;

  return (
    <Animated.View
      style={[
        styles.iconWrapper,
        focused && styles.iconWrapperActive,
        { 
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={[styles.icon, { fontSize: scaleFont(iconSize) }]}>
        {emoji}
      </Text>
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ProfessionalColors.primary,
        tabBarInactiveTintColor: ProfessionalColors.textSecondary,
        tabBarStyle: [
          styles.tabBar,
          {
            height: isTablet() ? 75 : isSmallDevice() ? 62 : 68,
            paddingBottom: Platform.OS === 'ios' ? getSpacing(8) : getSpacing(6),
            paddingTop: getSpacing(6),
            paddingHorizontal: getSpacing(2),
          },
        ],
        tabBarLabelStyle: [
          styles.tabBarLabel,
          {
            fontSize: scaleFont(isTablet() ? 12 : isSmallDevice() ? 10 : 11),
            marginTop: scaleSize(4),
            marginBottom: 0,
          },
        ],
        tabBarItemStyle: {
          paddingVertical: getSpacing(4),
          borderRadius: scaleSize(BorderRadius.md),
        },
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🎯" focused={focused} label="Activities" />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏆" focused={focused} label="Achievements" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" focused={focused} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: ProfessionalColors.white,
    borderTopWidth: 0,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    position: 'absolute',
  },
  tabBarLabel: {
    fontWeight: '600',
    marginTop: scaleSize(4),
    marginBottom: 0,
  },
  iconWrapper: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: scaleSize(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: ProfessionalColors.activeBackground,
  },
  icon: {
    textAlign: 'center',
  },
});
