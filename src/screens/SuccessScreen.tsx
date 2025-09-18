import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { NavigationScreen } from '../types';
import { COLORS, SIZES } from '../constants/theme';

interface SuccessScreenProps {
  onNavigate: (screen: NavigationScreen) => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ onNavigate }) => {
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate the success icon
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();

    // Auto-redirect after 5 seconds
    const timeout = setTimeout(() => {
      handleStartOver();
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const handleStartOver = () => {
    onNavigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.iconContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Ionicons name="checkmark-circle" size={120} color={COLORS.success} />
        </Animated.View>
        
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Order Complete!</Text>
          <Text style={styles.message}>
            Thank you for shopping with Zenith Nutrition.
          </Text>
          <Text style={styles.subtitle}>
            Your order has been processed successfully.
          </Text>
        </Animated.View>
        
        <View style={styles.actions}>
          <Button
            title="Start New Order"
            size="large"
            onPress={handleStartOver}
            style={styles.button}
          />
        </View>
        
        <Text style={styles.autoRedirect}>
          Automatically starting new session in 5 seconds...
        </Text>
      </View>
      
      <View style={styles.branding}>
        <Text style={styles.brandingText}>Zenith Nutrition</Text>
        <Text style={styles.brandingSubtext}>Self-Checkout Kiosk</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xl
  },
  iconContainer: {
    marginBottom: SIZES.spacing.xl
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.xxl
  },
  title: {
    fontSize: SIZES.font.header,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: SIZES.spacing.lg,
    textAlign: 'center'
  },
  message: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22
  },
  actions: {
    width: '100%',
    marginBottom: SIZES.spacing.lg
  },
  button: {
    width: '100%'
  },
  autoRedirect: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.light,
    textAlign: 'center'
  },
  branding: {
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light
  },
  brandingText: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4
  },
  brandingSubtext: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary
  }
});