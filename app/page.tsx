"use client";

import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import GallerySection from "@/components/GallerySection";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { Snowfall } from "@/components/ChristmasDecor";

export default function Home() {
  return (
    <>
      <Snowfall />
      <NavBar />
      <main>
        <HeroSection />
        <ProductsSection />
        <GallerySection />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
