import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, db } from '../lib/supabase';
import { api } from '../lib/api';
import { checkoutService } from '../services/checkout';
import { authService } from '../services/auth';
import { COLORS } from '../constants/theme';
import { NavigationScreen } from '../types';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  API_BASE_URL,
  BACKEND_BASE,
  KIOSK_AUTH_TOKEN,
} from '@env';

interface DebugScreenProps {
  onNavigate?: (screen: NavigationScreen) => void;
}

export default function DebugScreen({ onNavigate }: DebugScreenProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [upcInput, setUpcInput] = useState('123456789012');

  const runTest = async (testName: string, testFunc: () => Promise<any>) => {
    setLoading(true);
    setResult('Running test: ' + testName + '...\n');
    
    try {
      const startTime = Date.now();
      const response = await testFunc();
      const duration = Date.now() - startTime;
      
      setResult(
        `✅ ${testName}\n` +
        `Duration: ${duration}ms\n\n` +
        `Response:\n${JSON.stringify(response, null, 2)}`
      );
    } catch (error) {
      setResult(
        `❌ ${testName}\n` +
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {onNavigate && (
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => onNavigate('Home')}
          >
            <Ionicons name="home" size={24} color="white" />
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Debug & Test Screen</Text>
        <Text style={styles.subtitle}>
          Exercise Supabase queries and server API endpoints
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supabase Direct Queries</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => runTest('Get All Products', () => db.getProducts())}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Query: Get All Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => runTest('Get Categories', () => db.getCategories())}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Query: Get Categories</Text>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Test UPC Lookup:</Text>
          <TextInput
            style={styles.input}
            value={upcInput}
            onChangeText={setUpcInput}
            placeholder="Enter UPC code"
            placeholderTextColor={COLORS.text.secondary}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => runTest(`Get Product by UPC: ${upcInput}`, () => db.getProductByUPC(upcInput))}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Query: Get Product by UPC</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => runTest('Supabase Connection Test', async () => {
            const { data, error } = await supabase
              .from('products')
              .select('id')
              .limit(1);
            return { data, error, status: error ? 'error' : 'connected' };
          })}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test: Supabase Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => runTest('Get Products (API Shape)', () => db.getProductsApiShape())}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Query: Products (API Shape)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => runTest('Categories via Table (fallback to products)', () => db.getCategories())}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Query: Categories</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server API Endpoints</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => runTest('API Health Check', () => api.healthCheck())}
          disabled={loading}
        >
          <Text style={styles.buttonText}>GET /api/health</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => runTest('API Get Products', () => api.getProducts())}
          disabled={loading}
        >
          <Text style={styles.buttonText}>GET /api/products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => runTest('API Checkout', () => api.checkout({
            merchant_id: 'zenith_store_001',
            kiosk_id: 'kiosk_001',
            items: [
              { product_id: '1', quantity: 2, price: 39.99 }
            ],
            total: 79.98,
            payment_method: 'clover_mini'
          }))}
          disabled={loading}
        >
          <Text style={styles.buttonText}>POST /api/checkout (Test)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Checkout & Auth Tests</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            runTest('Test Checkout (Sample Order)', async () => {
              return await checkoutService.testCheckout();
            })
          }
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test: Checkout API</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            runTest('Check Auth Status', async () => {
              const user = authService.getUser();
              const token = await authService.getAccessToken();
              return {
                isAuthenticated: authService.isAuthenticated(),
                user: user ? { email: user.email, id: user.id } : null,
                hasToken: !!token,
              };
            })
          }
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test: Auth Status</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environment Configuration</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            runTest('Show Environment Variables', async () => ({
              SUPABASE_URL: SUPABASE_URL || '(not set)',
              SUPABASE_ANON_KEY: SUPABASE_ANON_KEY
                ? '***' + SUPABASE_ANON_KEY.slice(-8)
                : '(not set)',
              BACKEND_BASE: BACKEND_BASE || '(not set)',
              API_BASE_URL: API_BASE_URL || '(not set)',
              KIOSK_AUTH_TOKEN: KIOSK_AUTH_TOKEN
                ? '***' + KIOSK_AUTH_TOKEN.slice(-8)
                : '(not set)',
            }))
          }
          disabled={loading}
        >
          <Text style={styles.buttonText}>Show Environment Config</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {result !== '' && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Result:</Text>
          <ScrollView style={styles.resultScroll}>
            <Text style={styles.resultText}>{result}</Text>
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 60,
    position: 'relative',
  },
  homeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  resultContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    maxHeight: 400,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  resultScroll: {
    maxHeight: 350,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.text.primary,
  },
});
