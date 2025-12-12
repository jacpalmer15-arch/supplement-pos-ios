import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CartProvider } from './src/context/CartContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { BrowseScreen } from './src/screens/BrowseScreen';
import { CartScreen } from './src/screens/CartScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';
import { SuccessScreen } from './src/screens/SuccessScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { DebugScreen } from './src/screens';
import { useIdleTimer } from './src/utils/useIdleTimer';
import { CONFIG } from './src/constants/config';
import { COLORS } from './src/constants/theme';
import { NavigationScreen } from './src/types';
import { authService } from './src/services/auth';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('Home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize auth on app start - auto-login with hardcoded credentials
  useEffect(() => {
    const initAuth = async () => {
      let authenticated = await authService.initialize();
      
      // If not authenticated, auto-login with hardcoded credentials
      if (!authenticated) {
        const loginResult = await authService.login(
          'jacpalmer15@gmail.com',
          'jacobsipod10300'
        );
        authenticated = loginResult.success;
      }
      
      setIsAuthenticated(authenticated);
      setAuthLoading(false);
    };

    initAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentScreen('Home');
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setCurrentScreen('Home');
  };

  const handleTimeout = useCallback(() => {
    if (currentScreen !== 'Home') {
      Alert.alert(
        'Session Timeout',
        'Your session has timed out due to inactivity. Returning to home screen.',
        [{ text: 'OK', onPress: () => setCurrentScreen('Home') }],
        { cancelable: false }
      );
    }
  }, [currentScreen]);

  const { reset: resetIdleTimer } = useIdleTimer(
    handleTimeout,
    CONFIG.AUTO_RESET_ENABLED && currentScreen !== 'Success' && currentScreen !== 'Home'
  );

  const handleNavigate = useCallback((screen: NavigationScreen) => {
    setCurrentScreen(screen);
    resetIdleTimer();
  }, [resetIdleTimer]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'Scan':
        return <ScanScreen onNavigate={handleNavigate} />;
      case 'Browse':
        return <BrowseScreen onNavigate={handleNavigate} />;
      case 'Cart':
        return <CartScreen onNavigate={handleNavigate} />;
      case 'Checkout':
        return <CheckoutScreen onNavigate={handleNavigate} />;
      case 'Success':
        return <SuccessScreen onNavigate={handleNavigate} />;
      case 'Debug':
        return <DebugScreen onNavigate={handleNavigate} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // If auth failed, show error and allow manual retry
  if (!authLoading && !isAuthenticated) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, styles.loadingContainer]}>
          <Text style={styles.errorTitle}>Authentication Failed</Text>
          <Text style={styles.loadingText}>
            Unable to authenticate. Please check your connection.
          </Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <CartProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="auto" backgroundColor={COLORS.surface} />
          <View 
            style={styles.content}
            onTouchStart={resetIdleTimer}
          >
            {renderScreen()}
          </View>
        </SafeAreaView>
      </CartProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 8,
  },
});
