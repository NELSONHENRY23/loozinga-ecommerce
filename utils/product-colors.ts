import { inArray } from "drizzle-orm";

import { db } from "@/app/db";
import { productVariants } from "@/app/db/schema";

export async function getProductColors(productIds:string[]) {
    const colorsByProduct = new Map<string, string[]>();

    if(productIds.length === 0){
        return colorsByProduct;
    }

    const variantColors = await db.select({
        productId: productVariants.productId,
        color: productVariants.color,
    })
    .from(productVariants)
    .where(inArray(productVariants.productId, productIds));

    for (const variant of variantColors){
        const colors = colorsByProduct.get(variant.productId) ?? [];

        colors.push(variant.color);
        colorsByProduct.set(variant.productId, colors);
    }

    return colorsByProduct;
}