export type orderItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
    id: string;
    customer: string;
    email: string;
    phone: string;

    address: {
      street: string;
      city: string;
      country: string;
    }

    items: orderItem[];

    date: string;
    total: number;

    paymentMethod: 'COD' | 'Stripe';
    paymentStatus: 'Paid' | 'Pending';

    orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  };
  
  export const orders: Order[] = [
  {
    id: 'ORD-1001',
    customer: 'John Doe',
    email: 'john@example.com',
    phone: '+211 912 345 678',
    address: {
      street: 'Main Street 12',
      city: 'Juba',
      country: 'South Sudan',
    },
    items: [
      { id: 1, name: 'Classic Bag', quantity: 1, price: 45 },
      { id: 2, name: 'Men Hoodie', quantity: 1, price: 55 },
      { id: 3, name: 'Men Shoes', quantity: 1, price: 80 },
    ],
    date: '20 Aug 2026',
    total: 125.99,
    paymentMethod: 'Stripe',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
  },
  {
    id: 'ORD-1002',
    customer: 'Sarah James',
    email: 'sarah@example.com',
    phone: '+211 923 456 789',
    address: {
      street: 'Market Road 7',
      city: 'Wau',
      country: 'South Sudan',
    },
    items: [
      { id: 4, name: 'Men Loafers', quantity: 2, price: 65 },
    ],
    date: '19 Aug 2026',
    total: 89.5,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'Shipped',
  },
  {
    id: 'ORD-1003',
    customer: 'Michael Brown',
    email: 'michael@example.com',
    phone: '+211 955 123 456',
    address: {
      street: 'Airport Avenue 21',
      city: 'Malakal',
      country: 'South Sudan',
    },
    items: [
      { id: 5, name: 'Bomber Jacket', quantity: 1, price: 95 },
      { id: 6, name: 'Classic Bag', quantity: 1, price: 45 },
      { id: 7, name: 'Men Hoodie', quantity: 1, price: 55 },
    ],
    date: '18 Aug 2026',
    total: 210,
    paymentMethod: 'Stripe',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
  },
];