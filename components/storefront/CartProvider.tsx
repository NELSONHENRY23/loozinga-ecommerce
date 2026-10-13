
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { ReactNode } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  offer: number;
  image: string | null;
  quantity: number;
};

type NewCartItem = Omit<CartItem, 'quantity'>;

type CartContextType = {
  items: CartItem[];
  addItem: (product: NewCartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'loozinga-cart';
const MAX_QUANTITY = 99;

// Read saved cart data from the browser.
function getSavedCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        item !== null &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        Number.isFinite(item.price) &&
        item.price >= 0 &&
        typeof item.offer === 'number' &&
        Number.isFinite(item.offer) &&
        item.offer >= 0 &&
        item.offer <= 100 &&
        (item.image === null ||
          typeof item.image === 'string') &&
        typeof item.quantity === 'number' &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= MAX_QUANTITY,
    );
  } catch {
    console.error('Could not read saved cart');
    return [];
  }
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Restore the cart after the browser loads.
  useEffect(() => {
    // Delay restoration until after the initial render.
    const timeout = window.setTimeout(() => {
      setItems(getSavedCart());
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  // Save cart changes after restoration.
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items),
      );
    } catch {
      console.error('Could not save shopping cart');
    }
  }, [items, loaded]);

  function addItem(product: NewCartItem) {
    setItems((previous) => {
      const existing = previous.find(
        (item) => item.id === product.id,
      );

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  MAX_QUANTITY,
                  item.quantity + 1,
                ),
              }
            : item,
        );
      }

      return [
        ...previous,
        { ...product, quantity: 1 },
      ];
    });
  }

  function removeItem(id: string) {
    setItems((previous) =>
      previous.filter((item) => item.id !== id),
    );
  }

  function updateQuantity(id: string, quantity: number) {
    if (!Number.isInteger(quantity)) return;

    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(
                quantity,
                MAX_QUANTITY,
              ),
            }
          : item,
      ),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const total = items.reduce((sum, item) => {
    const discountedPrice =
      item.price * (1 - item.offer / 100);

    return sum + discountedPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider',
    );
  }

  return context;
}
