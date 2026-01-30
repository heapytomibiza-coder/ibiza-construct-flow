import { useTranslation } from 'react-i18next';

const SEOContentBlock = () => {
  const { t } = useTranslation('home');

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            {t('seoContent.title', 'Construction & Property Services Across Ibiza')}
          </h2>
          <div className="prose prose-lg text-muted-foreground max-w-none">
            <p>
              {t('seoContent.paragraph1', 
                'CS Ibiza connects homeowners, developers, and property managers with trusted construction professionals across Ibiza. From full villa renovations and new builds to carpentry, electrical work, plumbing, and bespoke finishes, our platform helps you find reliable tradespeople without stress, delays, or hidden risks.'
              )}
            </p>
            <p className="mt-4">
              {t('seoContent.paragraph2',
                'Whether you\'re renovating a historic finca, building a modern villa, or need urgent repairs, our verified network of Ibiza-based professionals delivers quality workmanship with the protection of secure payments and transparent reviews.'
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SEOContentBlock;
