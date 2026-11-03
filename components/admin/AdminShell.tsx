'use client'
import React, { useState } from 'react'
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

type AdminShellProps = {
  children: React.ReactNode;
  adminName: string;
}

export default function AdminShell({children, adminName}:AdminShellProps) {
    const [mobileSidebaropen, setMobileSidebaropen] = useState(false);

  return (
    <div className='min-h-screen bg-[#f1f2f7]'>
        <AdminHeader adminName={adminName} onMenuClick={()=>setMobileSidebaropen(!mobileSidebaropen)}/>

            <AdminSidebar open={mobileSidebaropen} onClose={()=> setMobileSidebaropen(false)}/>
            
            <main className='pt-15 md:ml-45'>
                {children}
            </main>
    </div>
  )
}

