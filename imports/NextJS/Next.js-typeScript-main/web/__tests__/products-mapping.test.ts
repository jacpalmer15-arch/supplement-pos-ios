import { ApiProduct, ProductTableRow } from '../lib/types';

// Test the data mapping logic from the products page
function mapApiProductsToTableRows(
  apiProducts: ApiProduct[], 
  categories: { id: string; name: string }[]
): ProductTableRow[] {
  return apiProducts.map((row) => ({
    clover_item_id: row.clover_item_id,
    name: row.name,
    category: categories.find((cat) => cat.id === row.category_id)?.name ?? '—',
    sku: row.sku,
    upc: row.upc,
    price: typeof row.price_cents === 'number' ? row.price_cents / 100 : null,
    cost: typeof row.cost_cents === 'number' ? row.cost_cents / 100 : null,
    visible_in_kiosk: row.visible_in_kiosk,
  }));
}

describe('Products Page Data Mapping', () => {
  const mockCategories = [
    { id: 'cat_1', name: 'Protein' },
    { id: 'cat_2', name: 'Pre-Workout' },
    { id: 'cat_3', name: 'Accessories' },
  ];

  test('maps API products to table rows correctly', () => {
    const mockApiProducts: ApiProduct[] = [
      {
        clover_item_id: 'itm_1001',
        name: 'Test Protein',
        category_id: 'cat_1',
        sku: 'TEST-PROT',
        upc: '123456789',
        visible_in_kiosk: true,
        price_cents: 2999, // $29.99
        cost_cents: 1500,  // $15.00
      },
      {
        clover_item_id: 'itm_1002',
        name: 'Test Pre-Workout',
        category_id: 'cat_2',
        sku: 'TEST-PRE',
        upc: '987654321',
        visible_in_kiosk: false,
        price_cents: 3499, // $34.99
        cost_cents: 2100,  // $21.00
      },
    ];

    const tableRows = mapApiProductsToTableRows(mockApiProducts, mockCategories);

    expect(tableRows).toEqual([
      {
        clover_item_id: 'itm_1001',
        name: 'Test Protein',
        category: 'Protein', // Resolved from category_id
        sku: 'TEST-PROT',
        upc: '123456789',
        visible_in_kiosk: true,
        price: 29.99, // Converted from cents
        cost: 15.00,  // Converted from cents
      },
      {
        clover_item_id: 'itm_1002',
        name: 'Test Pre-Workout',
        category: 'Pre-Workout', // Resolved from category_id
        sku: 'TEST-PRE',
        upc: '987654321',
        visible_in_kiosk: false,
        price: 34.99, // Converted from cents
        cost: 21.00,  // Converted from cents
      },
    ]);
  });

  test('handles unknown category_id gracefully', () => {
    const mockApiProducts: ApiProduct[] = [
      {
        clover_item_id: 'itm_1003',
        name: 'Unknown Category Product',
        category_id: 'unknown_cat',
        sku: null,
        upc: null,
        visible_in_kiosk: true,
        price_cents: 1999,
        cost_cents: null,
      },
    ];

    const tableRows = mapApiProductsToTableRows(mockApiProducts, mockCategories);

    expect(tableRows[0].category).toBe('—'); // Default for unknown category
    expect(tableRows[0].cost).toBe(null); // Null cost handled correctly
  });

  test('handles null price_cents and cost_cents correctly', () => {
    const mockApiProducts: ApiProduct[] = [
      {
        clover_item_id: 'itm_1004',
        name: 'No Price Product',
        category_id: null,
        sku: null,
        upc: null,
        visible_in_kiosk: false,
        price_cents: null,
        cost_cents: null,
      },
    ];

    const tableRows = mapApiProductsToTableRows(mockApiProducts, mockCategories);

    expect(tableRows[0]).toEqual({
      clover_item_id: 'itm_1004',
      name: 'No Price Product',
      category: '—', // No category
      sku: null,
      upc: null,
      visible_in_kiosk: false,
      price: null, // Null price handled correctly
      cost: null,  // Null cost handled correctly
    });
  });
});