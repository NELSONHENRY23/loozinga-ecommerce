import Link from "next/link";
import { ShoppingCart, Store } from "lucide-react";

export default function Navbar(){
    return(
        <header className="sticky top-0 x-50 border-b border-gray-200 bg-white">
            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
                <Link 
                   href="/"
                   className="flex items-center gap-2 font-bold text-xl text-gray-900"
                >
                    <Store size={24}/>
                    <span>Loozinga</span>
                </Link>

                <div className="flex items-center gap-5">
                   <Link 
                     href="/"
                     className="text-sm font-medium text-gray-700 hover:text-black"
                   >
                      Home
                   </Link>

                   <Link 
                     href="/account"
                     className="text-sm font-medium text-gray-700 hover:text-black"
                   >
                      Account
                   </Link>

                   <span
                     className="flex items-center gap-1 text-gray-400"
                     title="Shopping cart coming soon"
                     aria-label="Shopping cart coming soon"                   
                   >
                    <ShoppingCart size={21}/>
                   </span>
                </div>
            </nav>

        </header>
    )
}