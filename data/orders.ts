export type Order = {
    id: string;
    customer: string;
    email: string;
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
      date: '18 Aug 2026',
      total: 210,
      paymentMethod: 'Stripe',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
    },
  ];