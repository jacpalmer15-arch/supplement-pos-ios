import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CartProvider } from './src/context/CartContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { BrowseScreen } from './src/screens/BrowseScreen';
import { CartScreen } from './src/screens/CartScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';
import { SuccessScreen } from './src/screens/SuccessScreen';
import { DebugScreen } from './src/screens';
import { useIdleTimer } from './src/utils/useIdleTimer';
import { CONFIG } from './src/constants/config';
import { COLORS } from './src/constants/theme';
import { NavigationScreen } from './src/types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('Home');

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
        return <HomeScreen onNavigate={handleNavigate} />;
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
        return <DebugScreen />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

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
});
