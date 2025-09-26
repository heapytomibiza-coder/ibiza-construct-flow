import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Contact = () => {
  const { t } = useTranslation('pages');
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
              {t('contact.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('contact.hero.subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold mb-6">{t('contact.form.title')}</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form.name')}</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('contact.form.namePlaceholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form.email')}</label>
                  <input 
                    type="email" 
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form.message')}</label>
                  <textarea 
                    rows={5}
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('contact.form.messagePlaceholder')}
                  ></textarea>
                </div>
                
                <button type="submit" className="btn-primary w-full">
                  {t('contact.form.submit')}
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">info@csibiza.com</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <p className="text-muted-foreground">+34 971 XXX XXX</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">Ibiza, Balearic Islands<br />Spain</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <p className="text-muted-foreground">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 9:00 AM - 2:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;