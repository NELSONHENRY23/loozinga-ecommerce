export type User = {
    id: number;
    name: string;
    email: string;
    phone: string;
    joinedDate: string;
    totalOrders: number;
    totalSpent: number;
    status: 'Active' | 'Blocked';
};

export const users: User[] = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+60123456789',
        joinedDate: '12 Aug 2026',
        totalOrders: 5,
        totalSpent: 420.5,
        status: 'Active',
      },
      {
        id: 2,
        name: 'Sarah James',
        email: 'sarah@example.com',
        phone: '+60187654321',
        joinedDate: '5 Aug 2026',
        totalOrders: 3,
        totalSpent: 185,
        status: 'Active',
      },
      {
        id: 3,
        name: 'Michael Brown',
        email: 'michael@example.com',
        phone: '+60111222333',
        joinedDate: '28 Jul 2026',
        totalOrders: 1,
        totalSpent: 75.99,
        status: 'Blocked',
      },
];