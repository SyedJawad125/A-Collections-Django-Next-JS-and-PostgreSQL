'use client'
import Image from "next/image";
import Link from 'next/link';
import NavbarCom from "@/components/NavbarCom";
import TopNavbarCom from "@/components/TopNavbarCom";
import FooterCom from "@/components/FooterCom";
import BannerSliderHomeCom from "@/components/BannerSliderHomeCom";
// import LeftSideSliderCom from "@/components/LeftSideSliderCom";
// import PublicBlogHomeCom from "@/components/PublicBlogHomeCom";
import ContentpageHome from "@/components/ContentpageHome";
import AdModal from "@/components/AdModal";
import HeaderComponent from "@/components/HeaderComponent";
import PublicSalesProductsOnHome from "@/components/PublicSalesProductsOnHome";
import PublicNewArrivalOnHome from "@/components/PublicNewArrivalOnHome";
import PublicCategoriesOnHome from "@/components/PublicCategoriesOnHome";
import PublicProductsOnHome from "@/components/PublicProductsOnHome";
import PublicKidsComOnHome from "@/components/PublicKidsComOnHome";


export default function Home() {
  return (
    <>
    <AdModal />
    {/* <TopNavbarCom /> */}
    {/* <NavbarCom /> */}
    <HeaderComponent/>
    <BannerSliderHomeCom />
    {/* <PublicBlogHomeCom /> */}
    <PublicSalesProductsOnHome />
    <PublicCategoriesOnHome />
    <PublicKidsComOnHome />
    <PublicNewArrivalOnHome />
    <PublicProductsOnHome />
    {/* <LeftSideSliderCom /> */}
    {/* <ContentpageHome/> */}
    <FooterCom />
  </>
  );
}