export type Category = {
    id: number;
    name: string;
    productCount: number;
    status: 'Active' | 'Inactive';
  };
  
  export const categories: Category[] = [
    {
      id: 1,
      name: 'Men',
      productCount: 14,
      status: 'Active',
    },
    {
      id: 2,
      name: 'Women',
      productCount: 21,
      status: 'Active',
    },
    {
      id: 3,
      name: 'Accessories',
      productCount: 8,
      status: 'Active',
    },
    {
      id: 4,
      name: 'shoes',
      productCount: 19,
      status: 'Active',
    },
  ];