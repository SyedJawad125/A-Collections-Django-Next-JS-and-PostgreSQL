'use client'
import React from 'react'
import NavbarCom from "@/components/NavbarCom";
import NewArrivalsCom from "@/components/NewArrivalsCom";
import TopNavbarCom from "@/components/TopNavbarCom";
import FooterCom from "@/components/FooterCom";
import HeaderComponent from '@/components/HeaderComponent';


const about = () => {
  return (
    <div>
      {/* <TopNavbarCom/>
      <NavbarCom/> */}
      <HeaderComponent/>
      <NewArrivalsCom/>
      <div className="mt-20">
        <FooterCom />
      </div>
    </div>
  )
}

export default about