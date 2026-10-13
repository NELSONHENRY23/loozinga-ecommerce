import Link from "next/link";
import Image from "next/image";

type ProductCardProps = {
    product: {
        id: string;
        name: string;
        price: number;
        offer: number;
        categoryName: string | null;
        mainImage: string | null;
    }
}

export default function ProductCard({product}: ProductCardProps){
    const hasOffer = product.offer > 0 && product.offer <= 100;

    const discountedPrice = hasOffer ? product.price * (1 - product.offer / 100) : product.price;

    return(
        <Link
        href={`/products/${product.id}`}
        className="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
      >  <div className="relative aspect-square bg-gray-100">
                {
                    product.mainImage ? (
                        <Image
                          src={product.mainImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                        />
                    ):(
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            No image available
                        </div>
                    )
                }

                    {
                        hasOffer && (
                            <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                            -{product.offer}%
                            </span>
                        )
                    }
                
            </div>

            <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                    {product.categoryName ?? "Uncategorized"}
                </p>

                <h3 className="line-clamp-2 font-semibold text-gray-900">
                    {product.name}
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                        ${discountedPrice.toFixed(2)}
                    </span>

                    {
                        hasOffer && (
                            <span className="text-sm text-gray-400 line-through">
                                ${product.price.toFixed(2)}
                            </span>
                        )
                    }
                </div>
            </div>
            </Link>
    )

}