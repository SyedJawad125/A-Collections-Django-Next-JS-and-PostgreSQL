'use client'
import React from 'react'
import AddToCart from '@/components/AddToCart';
import HeaderComponent from '@/components/HeaderComponent';


const page = () => {
  return (
    <div>
      <HeaderComponent/>
      <AddToCart/>
    </div>
  )
}

export default page