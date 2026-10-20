import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';

import { db } from '@/app/db';
import {
  products,
  productVariants,
  productVariantSizes
} from '@/app/db/schema';

import { requireAdmin } from '@/utils/superbase/require-admin';
import ProductVariantsForm from '@/components/admin/ProductVariantsForm';

type Props = {
    params: Promise<{id: string}>;
}

export default async function ProductVariantsPage({params,}:Props) {
  // Require an administrator  
  await requireAdmin();

    const { id } = await params;

    // Validate the product ID
    const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 
    if (!uuidPattern.test(id)) {
        notFound();
      }

      // Fetch the product and confirm it exists
      const [product] = await db
    .select({
      id: products.id,
      name: products.name,
    })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

    if(!product){
        notFound();
    }

    // fetch its variants and configured sizes
    const variants = await db.select({
        id: productVariants.id, 
        color: productVariants.color,
        size: productVariantSizes.size,
    })
    .from(productVariants)
    .leftJoin(
      productVariantSizes,
      eq(productVariantSizes.variantId, productVariants.id),
    )
    .where(eq(productVariants.productId, id))
    .orderBy(
      asc(productVariants.createdAt),
      asc(productVariantSizes.size),
    );

    // Group the joined rows into the nested structure. 
    const variantWithSizes = Array.from(
      // Group repeated variant Ids and collect sizes.
      variants.reduce((grouped, row) => {
        const exisiting = grouped.get(row.id);

        if(exisiting){
    
          if(row.size !== null){
            exisiting.sizes.push(row.size);
          }

        }
        else
        {
          grouped.set(row.id, {
            id: row.id,
            color: row.color,
            sizes: row.size === null ? [] : [row.size],
          });
        }

        return grouped;
      }, new Map<string, {id: string; color: string; sizes: string[]}>()),

      // convert th grouped values to an array
      ([, variant]) => variant,
    );

    
    return(
        <div className="p-5">
             <Link
        href="/admin/products"
        className="text-sm text-blue-600 hover:underline"
      >
        Back to Products
      </Link>

      <div className="my-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Manage Product Colors
        </h1>

        <p className="mt-2 text-gray-500">
          {product.name}
        </p>
        </div>

        <ProductVariantsForm productId={product.id} variants={variantWithSizes}/>
        </div>
    )
}