'use client';
import React from 'react'
import AdminReviews from "@/components/AdminReviews";
import AdminSideNavbarCom from "@/components/AdminSideNavbarCom";



const page = () => {
  return (
     <div className="flex h-screen">
      
      <div className="w-[16%] bg-gray-800 text-white">
        <AdminSideNavbarCom />
      </div>
      <div className="w-[84%] p-6 bg-black">
        <AdminReviews />
      </div>
    </div> 
  )
}

export default page