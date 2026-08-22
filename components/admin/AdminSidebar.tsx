"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    Boxes,
    ShoppingCart,
    LayoutDashboard,
    LogOut,
    PackagePlus,
    Tags,
    User,
    Users,
} from 'lucide-react';

type AdminSidebarProps = {
    open: boolean;
    onClose: () => void;
}
const menuItems = [
    {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        name: "Products",
        href: "/admin/products",
        icon: Boxes,
    },
    {
        name: "Add New Product",
        href: "/admin/products/new",
        icon: PackagePlus,
    },
    {
        name: "Categories",
        href: "/admin/categories",
        icon: Tags,
    },
    {
        name: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
    },
    {
        name: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        name: "Account",
        href: "/admin/account",
        icon: User,
    },
  
    
]
function AdminSidebar({open, onClose}: AdminSidebarProps) {
    const pathname = usePathname();
  return (
    <>
    {/* Mobile dark overlay */}
    {
        open && (
            <button
                onClick={onClose}
                className='fixed inset-0 z-30 bg-black/40 md:hidden'
                aria-label='Close sidebar'
            />
        )
    }

    <aside 
        className={`
            fixed bottom-0 left-0 top-15 z-40
            w-45
            bg-[#394a59]
            transition-transform duration-300
            md:translate-x-0
            ${
                open ? "translate-x-0" : "-translate-x-full"
            }
            `}
    >
        <nav className='py-5'>
            {
                menuItems.map((item) => {
                    const Icon = item.icon;

                    const active = pathname === item.href;

                    return (
                        <Link key={item.name} href={item.href} onClick={onClose} className={`flex items-center gap-3 px-5 py-3 text-sm transition ${active ? "bg-[#223b46] text-white" : "text-gray-300 hover:bg-[#2e3b46] hover:text-white"}`}>
                            <Icon size={18}/>
                            <span>{item.name}</span>
                        </Link>
                    )
                })
            }
            <button className='flex w-full items-center gap-3 px-5 py-3 text-sm text-gray-300 transition hover:bg-[#2e3b46] hover:text-white'>
                <LogOut size={18}/>
                <span>Log Out</span>
            </button>
        </nav>
    </aside>
    </>
  )
}

export default AdminSidebar