import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import HowItWorks from '@/components/HowItWorks';
import ProfessionalNetwork from '@/components/ProfessionalNetwork';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <ProfessionalNetwork />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
