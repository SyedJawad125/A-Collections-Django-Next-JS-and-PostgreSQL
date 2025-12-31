// 'use client';
// import { createContext, useState, useContext } from 'react';

// export const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);

//   const addToCart = (product, quantity = 1, productType = null) => {
//     setCartItems((prevItems) => {
//       // Always enforce clear separation
//       let finalProductType;

//       if (productType) {
//         finalProductType = productType; // explicit if passed
//       } else if (product.productType) {
//         // trust product.productType if already set
//         finalProductType = product.productType;
//       } else if (product.isSales) {
//         finalProductType = 'sales_product';
//       } else {
//         finalProductType = 'regular_product';
//       }

//       // Unique key includes productType, so no conflicts across tables
//       const uniqueKey = `${finalProductType}_${product.id}_${product.size || 'default'}_${product.color || 'default'}`;

//       const existingItem = prevItems.find((item) => {
//         const itemKey = `${item.productType}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;
//         return itemKey === uniqueKey;
//       });

//       if (existingItem) {
//         return prevItems.map((item) => {
//           const itemKey = `${item.productType}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;
//           return itemKey === uniqueKey
//             ? { ...item, quantity: item.quantity + quantity }
//             : item;
//         });
//       } else {
//         return [...prevItems, { ...product, quantity, productType: finalProductType }];
//       }
//     });
//   };

//   const removeFromCart = (product) => {
//     setCartItems((prevItems) => {
//       const productKey = `${product.productType}_${product.id}_${product.size || 'default'}_${product.color || 'default'}`;
//       return prevItems.filter((item) => {
//         const itemKey = `${item.productType}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;
//         return itemKey !== productKey;
//       });
//     });
//   };

//   const updateQuantity = (product, newQuantity) => {
//     if (newQuantity < 1) {
//       removeFromCart(product);
//       return;
//     }

//     setCartItems((prevItems) => {
//       const productKey = `${product.productType}_${product.id}_${product.size || 'default'}_${product.color || 'default'}`;
//       return prevItems.map((item) => {
//         const itemKey = `${item.productType}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;
//         return itemKey === productKey
//           ? { ...item, quantity: newQuantity }
//           : item;
//       });
//     });
//   };

//   const clearCart = () => {
//     setCartItems([]);
//   };

//   // Helper functions to get products by type
//   const getRegularProducts = () => {
//     return cartItems.filter(item => item.productType === 'regular_product');
//   };

//   const getSalesProducts = () => {
//     return cartItems.filter(item => item.productType === 'sales_product');
//   };

//   // Debug
//   const getCartItemsWithKeys = () => {
//     return cartItems.map(item => ({
//       ...item,
//       uniqueKey: `${item.productType}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`
//     }));
//   };

//   return (
//     <CartContext.Provider 
//       value={{ 
//         cartItems, 
//         addToCart, 
//         removeFromCart, 
//         clearCart,
//         updateQuantity,
//         getRegularProducts,
//         getSalesProducts,
//         getCartItemsWithKeys 
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => useContext(CartContext);


'use client';
import { createContext, useState, useContext } from 'react';

export const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1, productType = null) => {
    setCartItems((prevItems) => {
      // Always enforce clear separation
      let finalProductType;

      if (productType) {
        finalProductType = productType; // explicit if passed
      } else if (product.productType) {
        // trust product.productType if already set
        finalProductType = product.productType;
      } else if (product.isSales || product.isSalesProduct) {
        finalProductType = 'sales_product';
      } else {
        finalProductType = 'regular_product';
      }

      // Unique key includes productType, so no conflicts across tables
      const uniqueKey = `${finalProductType}_${product.id}_${product.size || 'default'}_${product.color || 'default'}`;

      const existingItem = prevItems.find((item) => {
        const itemKey = `${item.productType}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;
        return itemKey === uniqueKey;
      });

      if (existingItem) {
        return prevItems.map((item) => {
          const itemKey = `${item.productType}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;
          return itemKey === uniqueKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      } else {
        return [...prevItems, { ...product, quantity, productType: finalProductType }];
      }
    });
  };

  const removeFromCart = (product) => {
    setCartItems((prevItems) => {
      const productKey = `${product.productType}_${product.id}_${product.size || 'default'}_${product.color || 'default'}`;
      return prevItems.filter((item) => {
        const itemKey = `${item.productType}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;
        return itemKey !== productKey;
      });
    });
  };

  const updateQuantity = (product, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(product);
      return;
    }

    setCartItems((prevItems) => {
      const productKey = `${product.productType}_${product.id}_${product.size || 'default'}_${product.color || 'default'}`;
      return prevItems.map((item) => {
        const itemKey = `${item.productType}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;
        return itemKey === productKey
          ? { ...item, quantity: newQuantity }
          : item;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Helper functions to get products by type
  const getRegularProducts = () => {
    return cartItems.filter(item => item.productType === 'regular_product');
  };

  const getSalesProducts = () => {
    return cartItems.filter(item => item.productType === 'sales_product');
  };

  // Debug
  const getCartItemsWithKeys = () => {
    return cartItems.map(item => ({
      ...item,
      uniqueKey: `${item.productType}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`
    }));
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        clearCart,
        updateQuantity,
        getRegularProducts,
        getSalesProducts,
        getCartItemsWithKeys 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider. Make sure your component is wrapped in <CartProvider>');
  }
  
  return context;
};