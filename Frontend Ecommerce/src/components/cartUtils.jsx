// cartUtils.js - Utility functions for cart management

/**
 * Creates a unique key for cart items based on product type, id, size, and color
 * This ensures products from different tables with same ID don't conflict
 */
export const createCartItemKey = (item) => {
  const productType = item.productType || (item.isSales ? 'sales_product' : 'product');
  const id = item.id;
  const size = item.size || 'default';
  const color = item.color || 'default';
  
  return `${productType}_${id}_${size}_${color}`;
};

/**
 * Determines the product type from various possible sources
 */
export const getProductType = (product, explicitType = null) => {
  if (explicitType) return explicitType;
  if (product.productType) return product.productType;
  if (product.isSales) return 'sales_product';
  return 'product';
};

/**
 * Gets the display price for a product (handles final_price vs price)
 */
export const getDisplayPrice = (item) => {
  return item.final_price !== undefined ? item.final_price : item.price;
};

/**
 * Formats price for display
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00';
  const num = typeof price === 'number' ? price : parseFloat(price);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Checks if two cart items are the same (same product, type, size, color)
 */
export const areCartItemsSame = (item1, item2) => {
  return createCartItemKey(item1) === createCartItemKey(item2);
};

/**
 * Prepares product for adding to cart with proper type identification
 */
export const prepareProductForCart = (product, quantity = 1, productType = null, size = null, color = null) => {
  const finalProductType = getProductType(product, productType);
  
  return {
    ...product,
    quantity,
    productType: finalProductType,
    size: size || product.size,
    color: color || product.color
  };
};

/**
 * Gets the correct image URL for a product
 */
export const getProductImageUrl = (item, baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000') => {
  if (item.image_urls && item.image_urls.length > 0) {
    return `${baseURL}${item.image_urls[0].startsWith('/') ? '' : '/'}${item.image_urls[0]}`;
  }
  if (item.image) {
    return `${baseURL}${item.image.startsWith('/') ? '' : '/'}${item.image}`;
  }
  return '/default-product-image.jpg';
};