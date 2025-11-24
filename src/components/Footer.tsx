import { Home, Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Footer = () => {
  const { value: brand } = useSiteSettings('footer', 'brand');
  const { value: contact } = useSiteSettings('footer', 'contact');
  const { value: social } = useSiteSettings('footer', 'social');
  
  return (
    <footer className="bg-charcoal text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-white text-lg">{brand?.name || 'CS Ibiza'}</h3>
                <p className="text-xs text-white/70 -mt-1">{brand?.tagline || 'Elite Network'}</p>
              </div>
            </div>
            <p className="text-body text-white/80 mb-6 leading-relaxed">
              {brand?.description || 'Constructive Solutions Ibiza connects you with the most trusted construction professionals on the island. From quick fixes to luxury builds.'}
            </p>
            <div className="flex space-x-4">
              <a href={social?.facebook || '#'} className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-copper transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={social?.instagram || '#'} className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-copper transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={social?.linkedin || '#'} className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-copper transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-display font-semibold text-white mb-6">Services</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-body text-white/80 hover:text-copper transition-all duration-300">Handyman Services</a></li>
              <li><a href="#" className="text-body text-white/80 hover:text-copper transition-all duration-300">Home Renovations</a></li>
              <li><a href="#" className="text-body text-white/80 hover:text-copper transition-all duration-300">Electrical Work</a></li>
              <li><a href="#" className="text-body text-white/80 hover:text-copper transition-all duration-300">Plumbing</a></li>
              <li><a href="#" className="text-body text-white/80 hover:text-copper transition-all duration-300">Construction</a></li>
              <li><a href="#" className="text-body text-white/80 hover:text-copper transition-all duration-300">Pool & Outdoor</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-display font-semibold text-white mb-6">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-body text-white/80 hover:text-copper transition-all duration-300">About Us</a></li>
              <li><a href="#" className="text-body text-white/80 hover:text-copper transition-all duration-300">How It Works</a></li>
              <li><a href="#" className="text-body text-white/80 hover:text-copper transition-all duration-300">Become a Professional</a></li>
              <li><a href="#" className="text-body text-white/80 hover:text-copper transition-all duration-300">SafePay Protection</a></li>
              <li><a href="#" className="text-body text-white/80 hover:text-copper transition-all duration-300">Trust & Safety</a></li>
              <li><a href="#" className="text-body text-white/80 hover:text-copper transition-all duration-300">Help Center</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-display font-semibold text-white mb-6">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-copper flex-shrink-0" />
                <span className="text-body text-white/80">{contact?.address || 'Ibiza, Balearic Islands, Spain'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-copper flex-shrink-0" />
                <span className="text-body text-white/80">{contact?.phone || '+34 971 XXX XXX'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-copper flex-shrink-0" />
                <span className="text-body text-white/80">{contact?.email || 'hello@csibiza.com'}</span>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="text-display font-medium text-white mb-3">{contact?.emergency?.title || 'Emergency Service'}</h5>
              <p className="text-body text-white/80 text-sm">{contact?.emergency?.description || '24/7 Support for urgent repairs'}</p>
              <p className="text-copper font-semibold">{contact?.emergency?.phone || '+34 600 XXX XXX'}</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-body text-white/60 text-sm mb-4 md:mb-0">
              © 2024 Constructive Solutions Ibiza. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6">
              <a href="#" className="text-body text-white/60 hover:text-copper text-sm transition-all duration-300">Privacy Policy</a>
              <a href="#" className="text-body text-white/60 hover:text-copper text-sm transition-all duration-300">Terms of Service</a>
              <a href="#" className="text-body text-white/60 hover:text-copper text-sm transition-all duration-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;