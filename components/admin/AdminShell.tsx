'use client'
import React, { useState } from 'react'
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminShell({children}:{children: React.ReactNode;}) {
    const [mobileSidebaropen, setMobileSidebaropen] = useState(false);

  return (
    <div className='min-h-screen bg-[#f1f2f7]'>
        <AdminHeader onMenuClick={()=>setMobileSidebaropen(!mobileSidebaropen)}/>

            <AdminSidebar open={mobileSidebaropen} onClose={()=> setMobileSidebaropen(false)}/>
            
            <main className='pt-15 md:ml-45'>
                {children}
            </main>
    </div>
  )
}

