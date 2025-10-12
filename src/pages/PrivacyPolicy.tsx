import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Constructive Solutions Ibiza ("we," "our," "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your personal information 
              in compliance with the General Data Protection Regulation (GDPR) and Spanish data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Data Controller</h2>
            <p>
              Constructive Solutions Ibiza<br />
              Email: privacy@constructivesolutionsibiza.com<br />
              Location: Ibiza, Spain
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Account Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, phone number</li>
              <li>Password (encrypted)</li>
              <li>Profile information (bio, location, profile picture)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Professional Verification Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Business licenses and certifications</li>
              <li>Insurance documents</li>
              <li>Identity verification documents</li>
              <li>Business registration details</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">3.3 Job and Transaction Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Job postings and descriptions</li>
              <li>Messages between users</li>
              <li>Payment information (processed by Stripe)</li>
              <li>Reviews and ratings</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">3.4 Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Pages visited and actions taken</li>
              <li>Session duration and interaction patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. How We Use Your Information</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our platform services</li>
              <li>Verify professional credentials</li>
              <li>Process payments and manage escrow</li>
              <li>Facilitate communication between users</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Send service notifications and updates</li>
              <li>Comply with legal obligations</li>
              <li>Analyze platform usage (with consent for analytics cookies)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Legal Basis for Processing (GDPR)</h2>
            <p>We process your data based on:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contract performance:</strong> To provide services you've requested</li>
              <li><strong>Legal obligation:</strong> For verification, fraud prevention, and compliance</li>
              <li><strong>Legitimate interest:</strong> For platform security and improvement</li>
              <li><strong>Consent:</strong> For marketing communications and optional analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Sharing</h2>
            <p>We share your data only when necessary:</p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">6.1 With Other Users</h3>
            <p>Profile information is visible to potential clients or professionals as needed for platform functionality.</p>

            <h3 className="text-xl font-semibold mt-4 mb-2">6.2 With Service Providers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe:</strong> Payment processing (see Stripe's privacy policy)</li>
              <li><strong>Supabase:</strong> Hosting and database services</li>
              <li><strong>Email services:</strong> Transactional notifications</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">6.3 Legal Requirements</h3>
            <p>We may disclose data to comply with legal obligations or respond to lawful requests from authorities.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
            <p>We use cookies for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential cookies:</strong> Required for platform functionality (authentication, security)</li>
              <li><strong>Analytics cookies:</strong> With your consent, to understand usage patterns</li>
            </ul>
            <p className="mt-2">
              See our <a href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</a> for details. 
              You can manage your preferences via the cookie banner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights (GDPR)</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interest</li>
              <li><strong>Withdraw consent:</strong> For marketing or analytics at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact: privacy@constructivesolutionsibiza.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide services. 
              After account closure, we may retain certain data for legal or audit purposes for up to 7 years.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption, secure servers, 
              and regular security audits. However, no system is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
            <p>
              Your data may be processed outside the EU/EEA by our service providers (e.g., Supabase). 
              We ensure appropriate safeguards are in place (Standard Contractual Clauses).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Children's Privacy</h2>
            <p>
              Our platform is not intended for users under 18. We do not knowingly collect data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy. We'll notify you of significant changes via email or platform notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact & Complaints</h2>
            <p>
              For privacy questions or to exercise your rights:<br />
              Email: privacy@constructivesolutionsibiza.com
            </p>
            <p className="mt-4">
              You also have the right to lodge a complaint with the Spanish Data Protection Agency (AEPD): 
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                www.aepd.es
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
