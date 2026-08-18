"use client"

import {
    Bell,
    Mail,
    Menu,
    Search,
    User,
} from 'lucide-react';

type AdminHeaderProps = {
    onMenuClick: () => void;
}

export default function AdminHeader({onMenuClick}:AdminHeaderProps) {
  return (
    <header className='fixed left-0 right-0 top-0 z-50 h-15 bg-[#36424a] text-white shadow'>
        <div className='flex h-full items-center'>
            {/* Logo */}
            <div className='flex h-full w-45 shrink-0 items-center px-4'>
                <button className='mr-3 md:hidden' onClick={onMenuClick} aria-label='open sidebar'>
                    <Menu size={23}/>
                </button>

                <span className='text-xl font-semibold'>
                    LooZinGa{" "}
                    <span className='font-light text-gray-300'>
                        Admin
                    </span>
                </span>
            </div>

            {/* Desktop Menu button */}

            <button onClick={onMenuClick} className='hidden px-4 md:block' aria-label='Toggle nabigation'>
                <Menu size={22}/>
            </button>

            {/* Search */}
            <div className='ml-2 hidden md:block'>
                <div className='relative'>
                    <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'/>
                    <input type="text" placeholder='Search' className='w-56 rounded border border-white/10 bg-white px-9 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-400' />
                </div>
            </div>

            {/* Right Side */}
            <div className='ml-auto flex h-full items-center gap-1 pr-2'>
                <HeaderIcon>
                    <Mail size={19}/>
                    <NotificationBage number={7}/>
                </HeaderIcon>

                <HeaderIcon>
                    <Bell size={19}/>
                    <NotificationBage number={7}/>
                </HeaderIcon>

                <div className='ml-2 flex h-full cursor-pointer items-center gap-3 border-0 transition hover:bg-white/5'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-200'>
                        <User size={19}/>
                    </div>

                    <span className='hidden text-sm font-medium text-gray-200 md:inline'>Nelson Henry</span>
                </div>

            </div>
        </div>
    </header>
  )
}

function HeaderIcon({children}:{children: React.ReactNode;}){
    return(
        <button className='relative flex h-15 w-11 items-center justify-center hover:bg-black/10'>{children}</button>
    )
}

function NotificationBage({number}:{number: number;}){
    return(
        <span className='absolute right-1 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white'>
            {number}
        </span>
    )
}

