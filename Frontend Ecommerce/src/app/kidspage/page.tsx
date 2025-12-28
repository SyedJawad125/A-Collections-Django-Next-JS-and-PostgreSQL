'use client'
import React from 'react'
import NavbarCom from "@/components/NavbarCom";
import KidsCom from "@/components/KidsCom";
import TopNavbarCom from "@/components/TopNavbarCom";
import FooterCom from "@/components/FooterCom";
import HeaderComponent from '@/components/HeaderComponent';


const about = () => {
  return (
    <div>
      {/* <TopNavbarCom/>
      <NavbarCom/> */}
      <HeaderComponent/>
      <KidsCom/>
      <div className="mt-20">
        <FooterCom />
      </div>
    </div>
  )
}

export default about