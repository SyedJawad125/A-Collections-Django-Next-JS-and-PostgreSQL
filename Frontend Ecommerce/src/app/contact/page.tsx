import React from 'react'
import NavbarCom from "@/components/NavbarCom";
import ContactPageCom from "@/components/ContactPageCom";
import TopNavbarCom from "@/components/TopNavbarCom";
import FooterCom from "@/components/FooterCom";
import HeaderComponent from '@/components/HeaderComponent';


const page = () => {
  return (
    <div>
      {/* <TopNavbarCom/>
      <NavbarCom/> */}
      <HeaderComponent/>
      <ContactPageCom/>
      {/* <FooterCom/> */}
    </div>
  )
}

export default page