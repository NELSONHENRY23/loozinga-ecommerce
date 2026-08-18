import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import ProductForm from '@/components/admin/ProductForm';

export default function page() {
  return (
    <div className="p-5">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Add Product</h1>

        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-blue-500">
            Home
          </Link>

          <ChevronRight size={14} />
          <Link href="/admin/products" className="hover:text-blue-500">
            Products
          </Link>

          <ChevronRight size={14} />

          <span>Add Product</span>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
