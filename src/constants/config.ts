export const CONFIG = {
  API_BASE: process.env.API_BASE || 'https://api.zenithnutrition.com',
  MERCHANT_ID: process.env.MERCHANT_ID || 'zenith_store_001',
  KIOSK_AUTH_TOKEN: process.env.KIOSK_AUTH_TOKEN || '',
  KIOSK_ID: process.env.KIOSK_ID || 'kiosk_001',
  IDLE_TIMEOUT_MINUTES: parseInt(process.env.IDLE_TIMEOUT_MINUTES || '2', 10),
  AUTO_RESET_ENABLED: process.env.AUTO_RESET_ENABLED === 'true',
  CLOVER_MINI_ENABLED: process.env.CLOVER_MINI_ENABLED === 'true',
  CLOVER_APP_ID: process.env.CLOVER_APP_ID || '',
  DEBUG_MODE: process.env.DEBUG_MODE === 'true'
};

export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CHECKOUT: '/api/checkout',
  HEALTH: '/api/health'
};

export const KIOSK_SETTINGS = {
  IDLE_TIMEOUT_MS: CONFIG.IDLE_TIMEOUT_MINUTES * 60 * 1000,
  MAX_CART_ITEMS: 50,
  MIN_PRODUCT_PRICE: 0.01,
  MAX_PRODUCT_PRICE: 999.99
};