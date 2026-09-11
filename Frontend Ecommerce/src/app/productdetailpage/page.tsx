'use client'
import React from 'react'
import ProductDetailsCom from "@/components/ProductDetailsCom";
import HeaderComponent from '@/components/HeaderComponent';
import FooterCom from "@/components/FooterCom";



const page = () => {
  return (
    <div>
      <HeaderComponent/>
      <ProductDetailsCom/>
      <FooterCom />
    </div>
  )
}

export default page