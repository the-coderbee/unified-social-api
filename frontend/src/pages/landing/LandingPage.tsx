import Navbar from '@/components/Navbar'
import HeroSection from './sections/HeroSection'
import FeaturesSection from './sections/FeaturesSection'
import PlatformsSection from './sections/PlatformsSection'
import HowItWorksSection from './sections/HowItWorksSection'
import ApiPreviewSection from './sections/ApiPreviewSection'
import PricingSection from './sections/PricingSection'
import CTASection from './sections/CTASection'
import Footer from './sections/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0 text-text-primary overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PlatformsSection />
        <HowItWorksSection />
        <ApiPreviewSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
