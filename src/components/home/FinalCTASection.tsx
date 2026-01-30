import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const FinalCTASection = () => {
  const { t } = useTranslation('home');

  return (
    <section className="py-20 bg-gradient-to-r from-sage-dark via-sage to-sage-muted">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-display text-3xl md:text-4xl font-bold text-white mb-4">
          {t('finalCTA.title', 'Ready to Start Your Project?')}
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          {t('finalCTA.subtitle', 'Join property owners across Ibiza who trust CS Ibiza to get the job done right.')}
        </p>
        <Button 
          asChild 
          size="lg" 
          className="btn-hero group"
        >
          <Link to="/post" className="inline-flex items-center gap-2">
            {t('finalCTA.button', 'Post Your Project')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default FinalCTASection;
