import { Home, Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation('footer');
  const { value: contact } = useSiteSettings('footer', 'contact');
  const { value: social } = useSiteSettings('footer', 'social');
  
  return (
    <footer className="bg-gradient-hero text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-primary-foreground/15 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-primary-foreground text-lg">{t('brand.name')}</h3>
                <p className="text-xs text-primary-foreground/80 -mt-1">{t('brand.tagline')}</p>
              </div>
            </div>
            <p className="text-body text-primary-foreground/85 mb-6 leading-relaxed">
              {t('brand.description')}
            </p>
            <div className="flex space-x-4">
              <a href={social?.facebook || '#'} className="w-10 h-10 bg-primary-foreground/15 rounded-lg flex items-center justify-center hover:bg-primary-foreground/25 transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={social?.instagram || '#'} className="w-10 h-10 bg-primary-foreground/15 rounded-lg flex items-center justify-center hover:bg-primary-foreground/25 transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={social?.linkedin || '#'} className="w-10 h-10 bg-primary-foreground/15 rounded-lg flex items-center justify-center hover:bg-primary-foreground/25 transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-display font-semibold text-primary-foreground mb-6">{t('sections.services.title')}</h4>
            <ul className="space-y-3">
              {(t('sections.services.links', { returnObjects: true }) as string[]).map((link, index) => (
                <li key={index}><a href="#" className="text-body text-primary-foreground/85 hover:text-primary-foreground underline-offset-4 hover:underline transition-all duration-300">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-display font-semibold text-primary-foreground mb-6">{t('sections.company.title')}</h4>
            <ul className="space-y-3">
              {(t('sections.company.links', { returnObjects: true }) as string[]).map((link, index) => (
                <li key={index}><a href="#" className="text-body text-primary-foreground/85 hover:text-primary-foreground underline-offset-4 hover:underline transition-all duration-300">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-display font-semibold text-primary-foreground mb-6">{t('sections.contact.title')}</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-foreground flex-shrink-0" />
                <span className="text-body text-primary-foreground/85">{t('sections.contact.address')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-foreground flex-shrink-0" />
                <span className="text-body text-primary-foreground/85">{contact?.phone || t('sections.contact.phone')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-foreground flex-shrink-0" />
                <span className="text-body text-primary-foreground/85">{contact?.email || t('sections.contact.email')}</span>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="text-display font-medium text-primary-foreground mb-3">{t('sections.contact.emergency.title')}</h5>
              <p className="text-body text-primary-foreground/85 text-sm">{t('sections.contact.emergency.description')}</p>
              <p className="text-primary-foreground font-semibold">{contact?.emergency?.phone || t('sections.contact.emergency.phone')}</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-body text-primary-foreground/70 text-sm mb-4 md:mb-0">
              {t('legal.copyright')}
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/privacy" className="text-body text-primary-foreground/70 hover:text-primary-foreground text-sm underline-offset-4 hover:underline transition-all duration-300">{(t('legal.links', { returnObjects: true }) as string[])[0]}</Link>
              <Link to="/terms" className="text-body text-primary-foreground/70 hover:text-primary-foreground text-sm underline-offset-4 hover:underline transition-all duration-300">{(t('legal.links', { returnObjects: true }) as string[])[1]}</Link>
              <Link to="/cookie-policy" className="text-body text-primary-foreground/70 hover:text-primary-foreground text-sm underline-offset-4 hover:underline transition-all duration-300">{(t('legal.links', { returnObjects: true }) as string[])[2]}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
