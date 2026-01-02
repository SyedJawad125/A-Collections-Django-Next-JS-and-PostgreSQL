'use client';
import React from 'react'
import AdminOrders from "@/components/AdminOrders";
import AdminSideNavbarCom from "@/components/AdminSideNavbarCom";



const page = () => {
  return (
     <div className="flex h-screen">
      
      <div className="w-[16%] bg-gray-800 text-white">
        <AdminSideNavbarCom />
      </div>
      <div className="w-[84%] p-6 bg-black">
        <AdminOrders />
      </div>
    </div> 
  )
}

export default page