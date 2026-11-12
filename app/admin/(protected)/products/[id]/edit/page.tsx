import { asc, eq } from 'drizzle-orm';
import Link from 'next/link';

import { db } from '@/app/db';
import { products, categories } from '@/app/db/schema';
import EditProductForm from '@/components/admin/EditProductForm';
import { notFound } from 'next/navigation';


export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  
    // Validate the product ID
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
    if (!uuidPattern.test(id)) {
      notFound();
    }
    
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      offer: products.offer,
      categoryId: products.categoryId,
    })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            Product Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            The product you are trying to edit does not exist.
          </p>

          <Link
            href="/admin/products"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const categoryList = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .orderBy(asc(categories.name));

  return (
    <EditProductForm
      product={product}
      categories={categoryList}
    />
  );
}