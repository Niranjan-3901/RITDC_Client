import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

const ThemedMinimalistAlert = ({
  type = 'INFO',
  title,
  message,
  onClose,
  autoClose = false,
  duration = 5000,
  style,
  theme = 'light', // Add theme prop with default value
}) => {
  // Define colors based on theme
  const colors = {
    background: theme === "dark" ? "#121212" : "#F5F7FA",
    cardBackground: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
    textPrimary: theme === "dark" ? "#FFFFFF" : "#333333",
    textSecondary: theme === "dark" ? "#AAAAAA" : "#666666",
    border: theme === "light" ? "#333333" : "#E1E4E8",
    accent: "#4A6FFF",
    success: "#4CAF50",
    warning: "#FFC107",
    danger: "#F44336",
  };
  
  const TYPES = {
    SUCCESS: {
      accentColor: colors.success,
      backgroundColor: theme === "dark" ? "#1A2E1A" : "#f0faf5",
      title: 'Success',
    },
    ERROR: {
      accentColor: colors.danger,
      backgroundColor: theme === "dark" ? "#2E1A1A" : "#fef2f2",
      title: 'Error',
    },
    WARNING: {
      accentColor: colors.warning,
      backgroundColor: theme === "dark" ? "#2E2A1A" : "#fffbeb",
      title: 'Warning',
    },
    INFO: {
      accentColor: colors.accent,
      backgroundColor: theme === "dark" ? "#1A1E2E" : "#eff6ff",
      title: 'Info',
    },
  };

  const alertType = TYPES[type.toUpperCase()] || TYPES.INFO;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation to fade in, slide down, and scale up
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();

    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        dismissAlert();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissAlert = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: alertType.backgroundColor,
      borderColor: colors.border,
      borderWidth: 1,
      // Add shadow for better separation from content below
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 5,
        },
      }),
    },
    title: {
      color: alertType.accentColor,
    },
    message: {
      color: theme === "dark" ? colors.textSecondary : "#4d4d4d",
    },
    closeText: {
      color: alertType.accentColor,
    }
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        dynamicStyles.container,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
        style
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`${title || alertType.title} alert: ${message || ''}`}
      // Explicitly set focus properties for all platforms
      focusable={true}
      importantForAccessibility="yes"
    >
      <View style={[styles.accent, { backgroundColor: alertType.accentColor }]} />
      
      <View style={styles.contentContainer}>
        <Text 
          style={[styles.title, dynamicStyles.title]}
          accessibilityRole="header"
        >
          {title || alertType.title}
        </Text>
        {message && (
          <Text 
            style={[styles.message, dynamicStyles.message]}
            accessibilityRole="text"
          >
            {message}
          </Text>
        )}
      </View>
      
      {onClose && (
        <TouchableOpacity 
          onPress={dismissAlert} 
          style={styles.closeButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close alert"
          accessibilityHint="Dismisses the current alert"
          focusable={true}
        >
          <Text style={[styles.closeText, dynamicStyles.closeText]}>×</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    marginTop: STATUSBAR_HEIGHT + 10,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
    zIndex: 1000,
  },
  accent: {
    width: 6,
    alignSelf: 'stretch',
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  closeButton: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 24,
  },
});

export default ThemedMinimalistAlert;