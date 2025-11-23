import { ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OptimizedImage } from '@/components/ui/optimized-image';
import heroImage from '@/assets/hero-construction.jpg';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('hero');
  const { value: stats } = useSiteSettings('hero', 'stats');
  const { value: badge } = useSiteSettings('hero', 'badge');
  const { value: title } = useSiteSettings('hero', 'title');
  const { value: subtitle } = useSiteSettings('hero', 'subtitle');
  const { value: description } = useSiteSettings('hero', 'description');

  const handlePostProject = () => {
    navigate('/post');
  };

  const handleBrowseServices = () => {
    navigate('/services');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Optimized with priority loading */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={heroImage}
          alt="Constructive Solutions Ibiza - Elite construction and building services"
          priority={true}
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sage-dark/85 via-sage/70 to-sage-muted/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl">
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-sage-muted-light fill-current" />
              ))}
            </div>
            <span className="text-white/90 text-sm font-medium">{(badge as unknown as string) || t('badge')}</span>
          </div>

          <h1 className="text-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {(title as unknown as string) || t('title')}<br />
            {(subtitle as unknown as string) || t('subtitle')}<br />
            <span className="text-sage-muted-light">{t('highlight')}</span>
          </h1>

          <p className="text-body text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
            {(description as unknown as string) || t('description')}
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-sage-muted-light" />
              <span className="text-white/90 text-sm font-medium">{t('trustIndicators.safepay')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-sage-muted-light" />
              <span className="text-white/90 text-sm font-medium">{t('trustIndicators.response')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-sage-muted-light" />
              <span className="text-white/90 text-sm font-medium">{t('trustIndicators.verified')}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              id="post-job-button"
              onClick={handlePostProject}
              className="btn-hero group"
            >
              {t('cta.postProject')}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleBrowseServices}
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              {t('cta.browseServices')}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20">
            <div>
              <div className="text-3xl font-bold text-white text-display">{stats?.pros || '500+'}</div>
              <div className="text-white/70 text-sm">{t('stats.pros')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white text-display">{stats?.projects || '2,000+'}</div>
              <div className="text-white/70 text-sm">{t('stats.projects')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white text-display">{stats?.protected || '€20M+'}</div>
              <div className="text-white/70 text-sm">{t('stats.protected')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;