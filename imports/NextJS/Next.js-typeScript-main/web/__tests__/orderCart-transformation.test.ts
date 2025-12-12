/**
 * @jest-environment node
 */

import { CartItem } from '@/lib/types';

// Test the transformation logic that converts UI cart to orderCart.lineItems
describe('OrderCart Transformation', () => {
  // Helper function that mimics the transformation in api.ts
  function buildOrderCartFromCart(cart: CartItem[]) {
    const lineItems: { item: { id: string } }[] = [];
    cart.forEach((ci) => {
      const id = ci.clover_item_id;
      const qty = Math.max(0, Number(ci.quantity) || 0);
      for (let i = 0; i < qty; i++) {
        lineItems.push({ item: { id } });
      }
    });
    return { orderCart: { lineItems } };
  }

  it('transforms single item with quantity 1', () => {
    const cart: CartItem[] = [
      {
        clover_item_id: '5VH00EF5Q3T9C',
        name: 'Test Item',
        price: 1000,
        quantity: 1,
      },
    ];

    const result = buildOrderCartFromCart(cart);

    expect(result).toEqual({
      orderCart: {
        lineItems: [
          { item: { id: '5VH00EF5Q3T9C' } },
        ],
      },
    });
  });

  it('transforms single item with quantity 3', () => {
    const cart: CartItem[] = [
      {
        clover_item_id: 'X2T3Y2ZTSYT7M',
        name: 'Test Item',
        price: 1000,
        quantity: 3,
      },
    ];

    const result = buildOrderCartFromCart(cart);

    expect(result).toEqual({
      orderCart: {
        lineItems: [
          { item: { id: 'X2T3Y2ZTSYT7M' } },
          { item: { id: 'X2T3Y2ZTSYT7M' } },
          { item: { id: 'X2T3Y2ZTSYT7M' } },
        ],
      },
    });
  });

  it('transforms multiple items with different quantities', () => {
    const cart: CartItem[] = [
      {
        clover_item_id: '5VH00EF5Q3T9C',
        name: 'Item 1',
        price: 1000,
        quantity: 1,
      },
      {
        clover_item_id: 'X2T3Y2ZTSYT7M',
        name: 'Item 2',
        price: 2000,
        quantity: 2,
      },
      {
        clover_item_id: 'TNWJNZ5Q26PPM',
        name: 'Item 3',
        price: 3000,
        quantity: 1,
      },
    ];

    const result = buildOrderCartFromCart(cart);

    expect(result).toEqual({
      orderCart: {
        lineItems: [
          { item: { id: '5VH00EF5Q3T9C' } },
          { item: { id: 'X2T3Y2ZTSYT7M' } },
          { item: { id: 'X2T3Y2ZTSYT7M' } },
          { item: { id: 'TNWJNZ5Q26PPM' } },
        ],
      },
    });
  });

  it('handles empty cart', () => {
    const cart: CartItem[] = [];
    const result = buildOrderCartFromCart(cart);

    expect(result).toEqual({
      orderCart: {
        lineItems: [],
      },
    });
  });

  it('handles zero quantity', () => {
    const cart: CartItem[] = [
      {
        clover_item_id: '5VH00EF5Q3T9C',
        name: 'Test Item',
        price: 1000,
        quantity: 0,
      },
    ];

    const result = buildOrderCartFromCart(cart);

    expect(result).toEqual({
      orderCart: {
        lineItems: [],
      },
    });
  });

  it('handles negative quantity by treating as zero', () => {
    const cart: CartItem[] = [
      {
        clover_item_id: '5VH00EF5Q3T9C',
        name: 'Test Item',
        price: 1000,
        quantity: -5,
      },
    ];

    const result = buildOrderCartFromCart(cart);

    expect(result).toEqual({
      orderCart: {
        lineItems: [],
      },
    });
  });
});
