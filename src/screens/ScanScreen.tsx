import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { supabaseService } from '../services/supabase';
import { NavigationScreen } from '../types';
import { COLORS, SIZES } from '../constants/theme';

interface ScanScreenProps {
  onNavigate: (screen: NavigationScreen) => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({ onNavigate }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  // Don't auto-request permission on mount
  useEffect(() => {
    // Check current permission status without requesting
    (async () => {
      const { status } = await BarCodeScanner.getPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const requestCameraPermission = async () => {
    setPermissionRequested(true);
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ type, data }: BarCodeScannerResult) => {
    if (scanned) return;
    
    setScanned(true);
    setLoading(true);

    try {
      const response = await supabaseService.getProductByUPC(data);
      
      if (response.success && response.data) {
        addItem(response.data);
        Alert.alert(
          'Product Added',
          `${response.data.name} has been added to your cart.`,
          [
            { text: 'Scan Another', onPress: () => setScanned(false) },
            { text: 'View Cart', onPress: () => onNavigate('Cart') }
          ]
        );
      } else {
        Alert.alert(
          'Product Not Found',
          'This product is not available in our kiosk system.',
          [{ text: 'Try Again', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Scanning Error',
        'There was a problem scanning this product. Please try again.',
        [{ text: 'Try Again', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHelpPress = () => {
    Alert.alert(
      'How to Scan',
      'Point your camera at the barcode on any product. The camera will automatically scan and add the product to your cart.\\n\\nIf you need assistance, please ask a store associate.',
      [{ text: 'Got it' }]
    );
  };

  if (hasPermission === null && !permissionRequested) {
    return (
      <View style={styles.container}>
        <Header 
          title="Barcode Scanner" 
          onHelpPress={handleHelpPress}
          showBackButton
          onBackPress={() => onNavigate('Browse')}
        />
        <View style={styles.centerContent}>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To scan product barcodes, we need access to your camera.
          </Text>
          <Button
            title="Allow Camera Access"
            onPress={requestCameraPermission}
            style={{ marginTop: SIZES.spacing.lg }}
          />
          <Button
            title="Browse Products Instead"
            variant="outline"
            onPress={() => onNavigate('Browse')}
            style={{ marginTop: SIZES.spacing.md }}
          />
        </View>
      </View>
    );
  }

  if (hasPermission === null && permissionRequested) {
    return (
      <View style={styles.container}>
        <Header 
          title="Requesting Camera Permission" 
          onHelpPress={handleHelpPress}
          showBackButton
          onBackPress={() => onNavigate('Browse')}
        />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Header 
          title="Camera Permission Denied" 
          onHelpPress={handleHelpPress}
          showBackButton
          onBackPress={() => onNavigate('Browse')}
        />
        <View style={styles.centerContent}>
          <Text style={styles.permissionTitle}>Camera Access Denied</Text>
          <Text style={styles.permissionText}>
            Camera access was denied. You can browse products instead or enable camera access in your device settings.
          </Text>
          <Button
            title="Try Again"
            onPress={requestCameraPermission}
            style={{ marginTop: SIZES.spacing.lg }}
          />
          <Button
            title="Browse Products Instead"
            variant="outline"
            onPress={() => onNavigate('Browse')}
            style={{ marginTop: SIZES.spacing.md }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Scan Product" 
        onHelpPress={handleHelpPress}
        showHomeButton={true}
        onHomePress={() => onNavigate('Home')}
      />
      
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.scanner}
        />
        
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
      </View>
      
      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>
          Position the barcode within the frame
        </Text>
        <Text style={styles.instructionText}>
          Point your camera at the product barcode. It will scan automatically.
        </Text>
      </View>
      
      <View style={styles.actions}>
        <Button
          title="Browse Products Instead"
          variant="outline"
          size="large"
          onPress={() => onNavigate('Browse')}
          style={styles.browseButton}
        />
      </View>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Looking up product...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scannerContainer: {
    flex: 1,
    position: 'relative'
  },
  scanner: {
    flex: 1
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative'
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
    borderWidth: 3,
    borderTopLeftRadius: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 10
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 10
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 10
  },
  instructions: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    alignItems: 'center'
  },
  instructionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.sm
  },
  instructionText: {
    fontSize: SIZES.font.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20
  },
  actions: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface
  },
  browseButton: {
    width: '100%'
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg
  },
  permissionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.sm
  },
  permissionText: {
    fontSize: SIZES.font.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SIZES.spacing.md,
    lineHeight: 20
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: COLORS.text.white,
    fontSize: SIZES.font.md,
    marginTop: SIZES.spacing.md
  }
});