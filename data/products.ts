export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  offer: number;
  category: string;
  color: string;
  images: {
    image: string;
    image1: string;
    image2: string;
    image3: string;
    image4: string;
  }
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Classic Bag',
    description: 'Black leather bag',
    price: 45,
    offer: 10,
    category: 'Bags',
    color: 'Brown',
    images: {
     image: '/products/bag.jpg',
     image1:  '/products/bag1.jpg',
     image2:  '/products/bag2.jpg',
     image3:  '/products/bag3.jpg',
     image4: '/products/bag4.jpg',
    
    },
  },
  {
    id: 2,
    name: 'Men Hoodie',
    description: 'Men hoodie',
    price: 55,
    offer: 5,
    category: 'Clothing',
    color: 'Black',
    images:{
       image: '/products/hoodie.jpg',
       image1: '/products/hoodie1.jpg',
       image2: '/products/hoodie3.jpg',
       image3: '/products/hoodie4.jpg',
       image4: '/products/hoodie5.jpg',
      }
  },
  {
    id: 3,
    name: 'Men Shoes',
    description: 'Men shoes',
    price: 80,
    offer: 15,
    category: 'Shoes',
    color: 'Black',
    images: {
      image:'/products/shoes_men.jpg',
      image1:'/products/shoes_men1.jpg',
      image2:'/products/shoes_men2.jpg',
      image3:'/products/shoes_men3.jpg',
      image4:'/products/shoes_men4.jpg',
    },
  },
  {
    id: 4,
    name: 'Men Loafers',
    description: 'Men Loafers',
    price: 65,
    offer: 0,
    category: 'Shoes',
    color: 'Brown',
    images: {
      image: '/products/loafers_men.jpg',
      image1: '/products/loafers_men1.jpg',
      image2: '/products/loafers_men2.jpg',
      image3: '/products/loafers_men3.jpg',
      image4: '/products/loafers_men4.jpg',
    },
  },
  {
    id: 5,
    name: 'Bomber Jacket',
    description: 'Boober Jacket',
    price: 95,
    offer: 10,
    category: 'Clothing',
    color: 'Black',
    images:{
      image: '/products/jacket_bomber_men.jpg',
      image1: '/products/jacket_bomber_men1.jpg',
      image2: '/products/jacket_bomber_men2.jpg',
      image3: '/products/jacket_bomber_men3.jpg',
      image4: '/products/jacket_bomber_men4.jpg',
    }
  },
];
