'use client'
import React from 'react'
import HeaderComponent from "@/components/HeaderComponent";
import NavbarCom from "@/components/NavbarCom";
import TopNavbarCom from "@/components/TopNavbarCom";
import FooterCom from "@/components/FooterCom";
import SalesDetail from "@/components/SalesDetail";

const page = () => {
  return (
    <div>
      <HeaderComponent/>
      <SalesDetail/>
      <FooterCom />

    </div>
  )
}

export default page