import Image from 'next/image';
import Link from 'next/link';
import {Pencil, Images, Trash2 } from 'lucide-react';

const products = [
    {
        id: 1,
        image: "/products/bag.jpg",
        name: "Classic Bag",
        price: 45,
        offer: 10,
        category: "Bags",
        color: "Brown",
      },
      {
        id: 2,
        image: "/products/hoodie.jpg",
        name: "Men Hoodie",
        price: 55,
        offer: 5,
        category: "Clothing",
        color: "Black",
      },
    {
      id: 3,
      image: "/products/shoes_men.jpg",
      name: "Men Shoes",
      price: 80,
      offer: 15,
      category: "Shoes",
      color: "Black",
    },
    {
      id: 4,
      image: "/products/loafers_men.jpg",
      name: "Men Loafers",
      price: 65,
      offer: 0,
      category: "Shoes",
      color: "Brown",
    },
    {
    id: 5,
    image: "/products/jacket_bomber_men.jpg",
    name: "Bomber Jacket",
    price: 95,
    offer: 10,
    category: "Clothing",
    color: "Black",
  },
];

export default function ProductsPage(){
    return (
        <div className='p-5'>
            {/* Page heading */}
            <div className='mb-6'>
                <h1 className='text-2xl font-semibold text-gray-700'>
                    Products
                </h1>

                <div className='mt-2 flex gap-2 text-sm text-gray-500'>
                    <Link href="/admin" className='hover:text-blue-500'>
                    Home</Link>
                    <span>/</span>
                    <span>Products</span>
                </div>
            </div>

            {/* Products panel */}
            <section className='overflow-hidden bg-white shadow-sm'>
                <div className='flex items-center justify-between border-b border-gray-200 px-5 py-4'>
                    <h2 className='text-lg font-semibold text-gray-700'>
                        Products
                    </h2>

                    <Link href="/admin/products/new" className='round bg-[#26c281] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#20a66e]'>
                          Add Product
                    </Link>
                </div>

                <div className='overflow-x-auto'>
                    <table className='w-full min-w-300 text-left text-sm'>
                        <thead className='bg-gray-50 text-xs uppercase text-gray-500'>
                            <tr>
                                <th className='px-5 py-4'>Product ID</th>
                                <th className='px-5 py-4'>Image</th>
                                <th className='px-5 py-4'>Product Name</th>
                                <th className='px-5 py-4'>Price</th>
                                <th className='px-5 py-4'>Offer</th>
                                <th className='px-5 py-4'>Category</th>
                                <th className='px-5 py-4'>Color</th>
                                <th className='px-5 py-4'>Images</th>
                                <th className='px-5 py-4'>Edit</th>
                                <th className='px-5 py-4'>Delete</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                products.map((product) => (
                                    <tr key={product.id} className='border-t border-gray-100 transition hover:bg-gray-50'>
                                        <td className='px-5 py-4 font-medium text-gray-700'>
                                            {product.id}
                                        </td>
                                        <td className='px-5 py-4'>
                                            <div className='relative h-17.5 w-17.5 overflow-hidden rounded'>
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </td>

                                        <td className='px-5 py-4 text-gray-700'>
                                            {product.name}
                                        </td>

                                        <td className='px-5 py-4'>
                                            ${product.price.toFixed(2)}
                                        </td>

                                        <td className='px-5 py-4'>
                                            {product.offer}%
                                        </td>
                                        <td className='px-5 py-4'>
                                            {product.category}
                                        </td>
                                        <td className='px-5 py-4'>
                                            {product.color}
                                        </td>

                                        <td className='px-5 py-4'>
                                            <Link
                                            href={`/admin/products/${product.id}/images`}
                                            className='inline-flex items-center gap-2 rounded bg-amber-500 px-3 py-2 text-white transition hover:bg-amber-600 '>
                                            <Images size={16}/>
                                            Images
                                            </Link>
                                        </td>

                                        <td className='px-5 py-4'>
                                            <Link
                                            href={`/admin/products/${product.id}/edit`}
                                            className='inline-flex items-center gap-2 rounded bg-blue-500 px-3 py-2 text-white transition hover:bg-blue-600 '>
                                            <Pencil size={16}/>
                                                Edit
                                            </Link>
                                        </td>

                                        <td className='px-5 py-4'>
                                            <button
                                            type='button'
                                            className='inline-flex items-center gap-2 rounded bg-red-500 px-3 py-2 text-white transition hover:bg-red-600 '>
                                            <Trash2 size={16}/>
                                                Delete
                                            </button>
                                        </td>

                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Temporary pagination */}
            <div className='mt-6 flex justify-center'>
                <div className='flex overflow-hidden rounded border border-gray-300 bg-white'>
                    <button type='button' disabled className='border-r border-gray-300 px-4 py-2 text-sm text-gray-400'>
                        Previous
                    </button>

                    <button type='button'  className='border-r border-gray-300 bg-blue-500 px-4 py-2 text-sm text-white'>
                        1
                    </button>
                    
                    <button type='button' className='border-r border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100'>
                        2
                    </button>

                    <button type='button' className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-100'>
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}