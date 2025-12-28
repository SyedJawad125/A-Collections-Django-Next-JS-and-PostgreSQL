'use client'
import React from 'react'
import NavbarCom from "@/components/NavbarCom";
import PublicCategoriesCom from "@/components/PublicCategoriesCom";
import TopNavbarCom from "@/components/TopNavbarCom";
import FooterCom from "@/components/FooterCom";
import HeaderComponent from '@/components/HeaderComponent';


const about = () => {
  return (
    <div>
      {/* <TopNavbarCom/>
      <NavbarCom/> */}
      <HeaderComponent/>
      <PublicCategoriesCom/>
      <div className="mt-20">
        <FooterCom />
      </div>
    </div>
  )
}

export default about