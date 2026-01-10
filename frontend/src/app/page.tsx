// import Hero from '@/components/landing/Hero';
// import Features from '@/components/landing/Features';
// import CallToAction from '@/components/landing/CallToAction';

import CallToAction from "../components/landing/CallToAction";
import Features from "../components/landing/Features";
import Hero from "../components/landing/Hero";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <CallToAction />
    </main>
  );
}
