import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { CartItem, NavigationScreen } from '../types';
import { COLORS, SIZES } from '../constants/theme';

interface CartScreenProps {
  onNavigate: (screen: NavigationScreen) => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onNavigate }) => {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(productId) }
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearCart }
      ]
    );
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) return;
    onNavigate('Checkout');
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Cart Help',
      'In your cart, you can:\\n\\n• Adjust item quantities using + and - buttons\\n• Remove items by tapping the trash icon\\n• Clear all items using "Clear Cart"\\n• Proceed to checkout when ready\\n\\nNeed assistance? Ask a store associate!',
      [{ text: 'Got it' }]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.product.image_url || 'https://via.placeholder.com/80x80?text=No+Image' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.product.name}
        </Text>
        {item.product.brand && (
          <Text style={styles.productBrand}>
            {item.product.brand}
          </Text>
        )}
        <Text style={styles.productPrice}>
          {formatPrice(item.product.price)} each
        </Text>
      </View>
      
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.product.id, item.quantity, -1)}
        >
          <Ionicons name="remove" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        
        <Text style={styles.quantity}>{item.quantity}</Text>
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.product.id, item.quantity, 1)}
        >
          <Ionicons name="add" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>
          {formatPrice(item.product.price * item.quantity)}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.product.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="basket-outline" size={64} color={COLORS.text.light} />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptyText}>
        Scan a product barcode or browse our selection to get started.
      </Text>
      <View style={styles.emptyActions}>
        <Button
          title="Scan Products"
          size="large"
          onPress={() => onNavigate('Scan')}
          style={styles.emptyButton}
        />
        <Button
          title="Browse Products"
          variant="outline"
          size="large"
          onPress={() => onNavigate('Browse')}
          style={styles.emptyButton}
        />
      </View>
    </View>
  );

  const renderFooter = () => {
    if (cart.items.length === 0) return null;

    return (
      <View style={styles.footer}>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items:</Text>
            <Text style={styles.summaryValue}>{cart.itemCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatPrice(cart.total)}</Text>
          </View>
        </View>
        
        <View style={styles.footerActions}>
          <Button
            title="Clear Cart"
            variant="outline"
            size="large"
            onPress={handleClearCart}
            style={styles.clearButton}
          />
          <Button
            title="Checkout"
            size="large"
            onPress={handleCheckout}
            style={styles.checkoutButton}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Shopping Cart"
        showBackButton
        onBackPress={() => onNavigate('Scan')}
        onHelpPress={handleHelpPress}
      />
      
      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      {renderFooter()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 200 // Account for footer
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.md,
    marginBottom: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius.sm,
    backgroundColor: COLORS.background
  },
  productInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md
  },
  productName: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2
  },
  productBrand: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary,
    marginBottom: 2
  },
  productPrice: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    fontWeight: '500'
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.spacing.md
  },
  quantityButton: {
    width: SIZES.touchTarget.small,
    height: SIZES.touchTarget.small,
    borderRadius: SIZES.touchTarget.small / 2,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.medium
  },
  quantity: {
    marginHorizontal: SIZES.spacing.md,
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    minWidth: 30,
    textAlign: 'center'
  },
  itemTotal: {
    alignItems: 'center'
  },
  itemTotalText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.spacing.xs
  },
  removeButton: {
    padding: SIZES.spacing.xs
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
    lineHeight: 22,
    marginBottom: SIZES.spacing.xl
  },
  emptyActions: {
    width: '100%'
  },
  emptyButton: {
    width: '100%',
    marginBottom: SIZES.spacing.md
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    padding: SIZES.spacing.lg
  },
  summary: {
    marginBottom: SIZES.spacing.md
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs
  },
  summaryLabel: {
    fontSize: SIZES.font.md,
    color: COLORS.text.secondary
  },
  summaryValue: {
    fontSize: SIZES.font.md,
    color: COLORS.text.primary,
    fontWeight: '500'
  },
  totalLabel: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text.primary
  },
  totalValue: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  clearButton: {
    flex: 0.4
  },
  checkoutButton: {
    flex: 0.55
  }
});