import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { apiService } from '../services/api';
import { CONFIG } from '../constants/config';
import { NavigationScreen, CheckoutRequest } from '../types';
import { COLORS, SIZES } from '../constants/theme';

interface CheckoutScreenProps {
  onNavigate: (screen: NavigationScreen) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ onNavigate }) => {
  const [processing, setProcessing] = useState(false);
  const { cart, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const handleCheckout = async () => {
    setProcessing(true);

    try {
      const checkoutRequest: CheckoutRequest = {
        merchant_id: CONFIG.MERCHANT_ID,
        kiosk_id: CONFIG.KIOSK_ID,
        items: cart.items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: cart.total,
        payment_method: CONFIG.CLOVER_MINI_ENABLED ? 'clover_mini' : 'card'
      };

      const response = await apiService.checkout(checkoutRequest);

      if (response.success) {
        if (response.data.clover_payment_required) {
          // Show Clover Mini payment instruction
          Alert.alert(
            'Complete Payment',
            'Please complete your payment on the Clover Mini device.',
            [
              {
                text: 'Payment Completed',
                onPress: () => {
                  clearCart();
                  onNavigate('Success');
                }
              }
            ],
            { cancelable: false }
          );
        } else {
          // Payment completed immediately
          clearCart();
          onNavigate('Success');
        }
      } else {
        Alert.alert(
          'Checkout Error',
          response.error || 'There was a problem processing your order. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Network Error',
        'Unable to process checkout. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Checkout Help',
      `Review your order and tap "Process Order" to complete your purchase.\\n\\n${
        CONFIG.CLOVER_MINI_ENABLED 
          ? 'You will be prompted to complete payment on the Clover Mini device.' 
          : 'Payment will be processed automatically.'
      }\\n\\nNeed assistance? Ask a store associate!`,
      [{ text: 'Got it' }]
    );
  };

  if (cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <Header 
          title="Checkout"
          showBackButton
          onBackPress={() => onNavigate('Cart')}
          onHelpPress={handleHelpPress}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={64} color={COLORS.text.light} />
          <Text style={styles.emptyTitle}>Nothing to checkout</Text>
          <Text style={styles.emptyText}>
            Your cart is empty. Add some products to continue.
          </Text>
          <Button
            title="Start Shopping"
            size="large"
            onPress={() => onNavigate('Scan')}
            style={{ marginTop: SIZES.spacing.lg }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Checkout"
        showBackButton
        onBackPress={() => onNavigate('Cart')}
        onHelpPress={handleHelpPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          {cart.items.map((item, index) => (
            <View key={item.product.id} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                {item.product.brand && (
                  <Text style={styles.orderItemBrand}>
                    {item.product.brand}
                  </Text>
                )}
                <Text style={styles.orderItemPrice}>
                  {formatPrice(item.product.price)} × {item.quantity}
                </Text>
              </View>
              <Text style={styles.orderItemTotal}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatPrice(cart.total)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>$0.00</Text>
          </View>
          
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>{formatPrice(cart.total)}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethod}>
            <Ionicons 
              name={CONFIG.CLOVER_MINI_ENABLED ? "card" : "card-outline"} 
              size={24} 
              color={COLORS.primary} 
            />
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodName}>
                {CONFIG.CLOVER_MINI_ENABLED ? 'Clover Mini' : 'Card Payment'}
              </Text>
              <Text style={styles.paymentMethodDescription}>
                {CONFIG.CLOVER_MINI_ENABLED 
                  ? 'Complete payment on the Clover Mini device'
                  : 'Secure card payment processing'
                }
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>Zenith Nutrition</Text>
            <Text style={styles.storeDetail}>Kiosk ID: {CONFIG.KIOSK_ID}</Text>
            <Text style={styles.storeDetail}>Merchant: {CONFIG.MERCHANT_ID}</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.footerSummary}>
          <Text style={styles.footerTotal}>
            Total: {formatPrice(cart.total)}
          </Text>
          <Text style={styles.footerItems}>
            {cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <Button
          title={processing ? 'Processing...' : 'Process Order'}
          size="large"
          onPress={handleCheckout}
          disabled={processing}
          loading={processing}
          style={styles.checkoutButton}
        />
      </View>
      
      {processing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.processingText}>
              {CONFIG.CLOVER_MINI_ENABLED 
                ? 'Preparing payment on Clover Mini...'
                : 'Processing your order...'
              }
            </Text>
          </View>
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
  content: {
    flex: 1,
    padding: SIZES.spacing.md
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.md
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.md
  },
  orderItemInfo: {
    flex: 1,
    marginRight: SIZES.spacing.md
  },
  orderItemName: {
    fontSize: SIZES.font.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 2
  },
  orderItemBrand: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary,
    marginBottom: 2
  },
  orderItemPrice: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary
  },
  orderItemTotal: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.primary
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: SIZES.spacing.md
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm
  },
  totalLabel: {
    fontSize: SIZES.font.md,
    color: COLORS.text.secondary
  },
  totalValue: {
    fontSize: SIZES.font.md,
    fontWeight: '500',
    color: COLORS.text.primary
  },
  grandTotalRow: {
    paddingTop: SIZES.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    marginBottom: 0
  },
  grandTotalLabel: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text.primary
  },
  grandTotalValue: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  paymentMethodInfo: {
    marginLeft: SIZES.spacing.md
  },
  paymentMethodName: {
    fontSize: SIZES.font.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 2
  },
  paymentMethodDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary
  },
  storeInfo: {},
  storeName: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.spacing.sm
  },
  storeDetail: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary,
    marginBottom: 2
  },
  footer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    padding: SIZES.spacing.lg
  },
  footerSummary: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.md
  },
  footerTotal: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  footerItems: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary,
    marginTop: 2
  },
  checkoutButton: {
    width: '100%'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xl
  },
  emptyTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.sm
  },
  emptyText: {
    fontSize: SIZES.font.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  processingContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.xl,
    alignItems: 'center',
    minWidth: 200
  },
  processingText: {
    fontSize: SIZES.font.md,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: SIZES.spacing.md
  }
});