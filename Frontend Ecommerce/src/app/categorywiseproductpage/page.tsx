import React from 'react'
import CategoryWiseProductCom from "@/components/CategoryWiseProductCom";
import HeaderComponent from '@/components/HeaderComponent';

import FooterCom from "@/components/FooterCom";

const page = () => {
  return (
    <div>
        <HeaderComponent />
        <CategoryWiseProductCom/>
        <FooterCom />
    </div>
  )
}

export default page