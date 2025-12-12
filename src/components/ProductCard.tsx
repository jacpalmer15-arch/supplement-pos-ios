import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import { Product } from '../types';
import { COLORS, SIZES } from '../constants/theme';
import { Button } from './Button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showAddButton?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  showAddButton = true
}) => {
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: product.image_url || 'https://via.placeholder.com/150x150?text=No+Image' }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        {product.brand && (
          <Text style={styles.brand}>
            {product.brand}
          </Text>
        )}
        
        <Text style={styles.price}>
          {formatPrice(product.price)}
        </Text>
        
        {product.description && (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.stockInfo}>
            <View style={[styles.stockIndicator, product.in_stock ? styles.inStock : styles.outOfStock]} />
            <Text style={styles.stockText}>
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
          
          {showAddButton && product.in_stock && (
            <Button
              title="Add to Cart"
              size="small"
              onPress={() => onAddToCart(product)}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.md,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 5,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.background
  },
  content: {
    padding: SIZES.spacing.md
  },
  name: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SIZES.spacing.xs
  },
  brand: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary,
    marginBottom: SIZES.spacing.xs
  },
  price: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.spacing.sm
  },
  description: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary,
    marginBottom: SIZES.spacing.md,
    lineHeight: 18
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SIZES.spacing.xs
  },
  inStock: {
    backgroundColor: COLORS.success
  },
  outOfStock: {
    backgroundColor: COLORS.error
  },
  stockText: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary
  }
});