import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { supabaseService } from '../services/supabase';
import { Product, NavigationScreen } from '../types';
import { COLORS, SIZES } from '../constants/theme';

interface BrowseScreenProps {
  onNavigate: (screen: NavigationScreen) => void;
}

export const BrowseScreen: React.FC<BrowseScreenProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem, cart } = useCart();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products, selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await supabaseService.getProducts();
      
      if (response.success) {
        setProducts(response.data);
      } else {
        Alert.alert(
          'Error Loading Products',
          response.error || 'Unable to load products. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Network Error',
        'Unable to connect to Supabase. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await supabaseService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    await loadCategories();
    setRefreshing(false);
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
    Alert.alert(
      'Product Added',
      `${product.name} has been added to your cart.`,
      [
        { text: 'Continue Shopping' },
        { text: 'View Cart', onPress: () => onNavigate('Cart') }
      ]
    );
  };

  const handleHelpPress = () => {
    Alert.alert(
      'How to Browse',
      'Browse all available products or use the search bar to find specific items. Tap "Add to Cart" to add products to your cart.\\n\\nUse the search bar to quickly find products by name, category, or brand.',
      [{ text: 'Got it' }]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <ProductCard
        product={item}
        onAddToCart={handleAddToCart}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={COLORS.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.text.secondary}
        />
        {searchQuery.length > 0 && (
          <Button
            title="Clear"
            size="small"
            variant="outline"
            onPress={() => setSearchQuery('')}
          />
        )}
      </View>
      
      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                !selectedCategory && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.categoryButtonText,
                !selectedCategory && styles.categoryButtonTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
          {selectedCategory && ` in ${selectedCategory}`}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={48} color={COLORS.text.light} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No products found' : 'No products available'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery 
          ? `No products match "${searchQuery}". Try a different search term.`
          : 'There are no products currently available in the kiosk.'
        }
      </Text>
      {searchQuery && (
        <Button
          title="Clear Search"
          variant="outline"
          onPress={() => setSearchQuery('')}
          style={{ marginTop: SIZES.spacing.lg }}
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Browse Products" onHelpPress={handleHelpPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Browse Products" 
        onHelpPress={handleHelpPress}
        rightContent={
          cart.itemCount > 0 && (
            <Button
              title={`Cart (${cart.itemCount})`}
              size="small"
              onPress={() => onNavigate('Cart')}
            />
          )
        }
      />
      
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      />
      
      <View style={styles.footer}>
        <Button
          title="Scan Barcode (Optional)"
          variant="outline"
          size="large"
          onPress={() => onNavigate('Scan')}
          style={styles.scanButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: SIZES.spacing.md,
    fontSize: SIZES.font.md,
    color: COLORS.text.secondary
  },
  listContent: {
    padding: SIZES.spacing.md,
    paddingBottom: 100 // Account for footer
  },
  searchContainer: {
    marginBottom: SIZES.spacing.lg
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.spacing.sm,
    fontSize: SIZES.font.md,
    color: COLORS.text.primary
  },
  resultsInfo: {
    alignItems: 'center'
  },
  resultsText: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary
  },
  productContainer: {
    flex: 0.5,
    marginHorizontal: SIZES.spacing.xs
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.xxl
  },
  emptyTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.sm
  },
  emptyText: {
    fontSize: SIZES.font.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light
  },
  scanButton: {
    width: '100%'
  },
  categoriesContainer: {
    marginBottom: SIZES.spacing.md,
  },
  categoryButton: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    marginRight: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  }
});