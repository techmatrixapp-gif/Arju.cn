import { useEffect } from "react";
import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import Story from "../components/Story";
import MenuSection from "../components/MenuSection";
import OrderSection from "../components/OrderSection";
import Gallery from "../components/Gallery";
import Testimonials from "../components/Testimonials";
import Visit from "../components/Visit";

export default function HomePage() {
  useEffect(() => {
    document.title = "ARJU — Taste of Canada | Downtown Toronto Halal Kitchen & Grill";
  }, []);

  return (
    <>
      <Hero />
      <Marquee />
      <Story />
      <MenuSection />
      <OrderSection />
      <Gallery />
      <Testimonials />
      <Visit />
    </>
  );
}
