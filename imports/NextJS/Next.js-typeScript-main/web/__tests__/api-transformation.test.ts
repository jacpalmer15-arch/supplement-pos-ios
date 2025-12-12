import { Product, ApiProduct } from '../lib/types';

// Test the data transformation logic from our API route
function transformProductToApiProduct(dbProduct: Product): ApiProduct {
  return {
    clover_item_id: dbProduct.clover_item_id,
    name: dbProduct.name,
    category_id: dbProduct.category, // Map category to category_id
    sku: dbProduct.sku,
    upc: dbProduct.upc,
    visible_in_kiosk: dbProduct.visible_in_kiosk,
    price_cents: dbProduct.price, // Map price to price_cents
    cost_cents: dbProduct.cost, // Map cost to cost_cents
  };
}

describe('Product API Transformation', () => {
  test('transforms database Product to ApiProduct correctly', () => {
    const mockDbProduct: Product = {
      clover_item_id: 'itm_1001',
      name: 'Test Product',
      category: 'Test Category',
      sku: 'TEST-SKU',
      upc: '123456789',
      visible_in_kiosk: true,
      price: 2999, // $29.99 in cents
      cost: 1500,  // $15.00 in cents
    };

    const apiProduct = transformProductToApiProduct(mockDbProduct);

    expect(apiProduct).toEqual({
      clover_item_id: 'itm_1001',
      name: 'Test Product',
      category_id: 'Test Category', // Transformed from category
      sku: 'TEST-SKU',
      upc: '123456789',
      visible_in_kiosk: true,
      price_cents: 2999, // Transformed from price
      cost_cents: 1500,  // Transformed from cost
    });
  });

  test('handles null values correctly', () => {
    const mockDbProduct: Product = {
      clover_item_id: 'itm_1002',
      name: 'Test Product 2',
      category: null,
      sku: null,
      upc: null,
      visible_in_kiosk: false,
      price: null,
      cost: null,
    };

    const apiProduct = transformProductToApiProduct(mockDbProduct);

    expect(apiProduct).toEqual({
      clover_item_id: 'itm_1002',
      name: 'Test Product 2',
      category_id: null,
      sku: null,
      upc: null,
      visible_in_kiosk: false,
      price_cents: null,
      cost_cents: null,
    });
  });
});