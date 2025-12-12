import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationScreen } from '../types';
import { COLORS, SIZES } from '../constants/theme';
import { CONFIG } from '../constants/config';

interface HomeScreenProps {
  onNavigate: (screen: NavigationScreen) => void;
  onLogout?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onLogout }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="nutrition" size={60} color={COLORS.primary} />
          <Text style={styles.logoText}>Zenith Nutrition</Text>
          <Text style={styles.logoSubtext}>Self-Service Kiosk</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>Welcome!</Text>
        <Text style={styles.welcomeSubtitle}>
          Browse our premium supplements and complete your purchase
        </Text>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => onNavigate('Browse')}
        >
          <Ionicons name="play-circle" size={48} color={COLORS.surface} />
          <Text style={styles.startButtonText}>START SHOPPING</Text>
        </TouchableOpacity>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="apps" size={32} color={COLORS.primary} />
            <Text style={styles.featureText}>Browse Products</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="scan" size={32} color={COLORS.primary} />
            <Text style={styles.featureText}>Scan Barcodes</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="card" size={32} color={COLORS.primary} />
            <Text style={styles.featureText}>Easy Checkout</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Need assistance? Please ask a store associate
        </Text>
        <View style={styles.footerButtons}>
          {CONFIG.DEBUG_MODE && (
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => onNavigate('Debug')}
            >
              <Ionicons name="bug" size={20} color={COLORS.surface} />
              <Text style={styles.debugButtonText}>Debug Screen</Text>
            </TouchableOpacity>
          )}
          {onLogout && (
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={onLogout}
            >
              <Ionicons name="log-out" size={20} color={COLORS.error} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: SIZES.spacing.xl * 2,
    paddingBottom: SIZES.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: SIZES.font.xxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SIZES.spacing.md,
  },
  logoSubtext: {
    fontSize: SIZES.font.lg,
    color: COLORS.text.secondary,
    marginTop: SIZES.spacing.xs,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.spacing.xl,
  },
  welcomeTitle: {
    fontSize: SIZES.font.xxxl,
    fontWeight: '800',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.md,
  },
  welcomeSubtitle: {
    fontSize: SIZES.font.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.spacing.xl * 2,
    maxWidth: 400,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.xl,
    paddingHorizontal: SIZES.spacing.xl * 2,
    borderRadius: SIZES.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(51, 51, 51, 0.15)',
    elevation: 8,
    marginBottom: SIZES.spacing.xl * 2,
    minWidth: 280,
    flexDirection: 'row',
  },
  startButtonText: {
    color: COLORS.surface,
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    marginLeft: SIZES.spacing.md,
    letterSpacing: 1,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 600,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SIZES.spacing.sm,
    fontWeight: '500',
  },
  footer: {
    paddingBottom: SIZES.spacing.xl,
    paddingHorizontal: SIZES.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: SIZES.font.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
  },
  debugButton: {
    backgroundColor: COLORS.warning,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugButtonText: {
    color: COLORS.surface,
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    marginLeft: SIZES.spacing.xs,
  },
  logoutButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutButtonText: {
    color: COLORS.error,
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    marginLeft: SIZES.spacing.xs,
  },
});