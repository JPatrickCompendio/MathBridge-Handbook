# Math Bridge Handbook - Folder Structure

This document explains the folder structure of the Math Bridge Handbook mobile application.

## 📁 Project Structure

```
math-bridge-handbook/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (auth)/                   # Authentication group
│   │   ├── _layout.tsx          # Auth layout configuration
│   │   ├── login.tsx            # Login screen
│   │   └── signup.tsx           # Sign up screen (to be created)
│   ├── (tabs)/                   # Main app screens group (to be created)
│   │   ├── _layout.tsx          # Tab navigation layout
│   │   ├── index.tsx            # Homepage/Dashboard
│   │   ├── lessons.tsx          # Lessons screen
│   │   ├── activities.tsx       # Activities screen
│   │   └── progress.tsx          # Progress screen
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Entry point (Loading screen)
│
├── components/                   # Reusable React components
│   ├── ui/                      # UI components
│   │   ├── Button.tsx           # Custom button component
│   │   └── Input.tsx            # Custom input component
│   └── LoadingScreen.tsx        # Loading/Splash screen component
│
├── constants/                    # App-wide constants
│   └── colors.ts                # Color palette, spacing, border radius
│
├── types/                        # TypeScript type definitions (to be created)
│
├── utils/                        # Utility functions (to be created)
│
└── assets/                       # Static assets (images, fonts, etc.)
    └── images/                   # Image files
```

## 📝 Folder Descriptions

### `app/`
Contains all screen components using Expo Router's file-based routing system.
- Files in `app/` become routes automatically
- Groups (folders with parentheses) organize related screens
- `_layout.tsx` files define navigation structure for groups

### `app/(auth)/`
Authentication-related screens:
- Login screen
- Sign up screen
- Forgot password screen (to be added)

### `app/(tabs)/`
Main application screens (to be created):
- Homepage with topics menu
- Lessons screen
- Activities screen
- Progress/Score tracker

### `components/`
Reusable UI components that can be used across multiple screens.

### `components/ui/`
Basic UI building blocks:
- Button component with variants (primary, secondary, outline, text)
- Input component with validation support

### `constants/`
App-wide constants like colors, spacing values, and other configuration.

### `types/`
TypeScript type definitions for better type safety (to be added as needed).

### `utils/`
Helper functions and utilities (to be added as needed).

## 🎨 Design System

The app uses a consistent design system defined in `constants/colors.ts`:
- **Primary Color**: Blue (#4A90E2) - Main brand color
- **Secondary Color**: Green (#50C878) - Success/positive actions
- **Difficulty Colors**: 
  - Easy: Green
  - Medium: Orange
  - Hard: Red

## 🚀 Current Status

✅ **Completed:**
- Folder structure setup
- Loading/Splash screen
- Login screen with form validation
- Reusable UI components (Button, Input)
- Color constants and design system

⏳ **To Be Created:**
- Sign up screen
- Forgot password screen
- Homepage/Dashboard
- Topic pages
- Practice/Activity screens
- Progress tracker
- Navigation structure

