import { useEffect } from 'react';
import Navbarr from '../../components/Navbarr';
import Hero from '../../components/Hero';
import Benefits from '../../components/Benefits';
import Features from '../../components/Features';
import CoreFeatures from '../../components/Core-features';
import Contact from '../../components/Contact';
import Footer from '../../components/Footer';

export default function LandingPage() {
  useEffect(() => {
    // Smooth scrolling for anchor links
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbarr />
      <Hero />
      <Benefits />
      <Features />
      <CoreFeatures />
      <Contact />
      <Footer />
    </main>
  );
}
