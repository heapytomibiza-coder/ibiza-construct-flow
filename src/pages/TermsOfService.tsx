import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
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

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Constructive Solutions Ibiza ("the Platform"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">2.1 Registration</h3>
            <p>You must provide accurate, complete information when creating an account. You are responsible for maintaining the security of your account credentials.</p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">2.2 Professional Accounts</h3>
            <p>Professional service providers must undergo verification before being listed on the platform. We reserve the right to reject or revoke verification at any time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Services</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Platform Role</h3>
            <p>
              Constructive Solutions Ibiza acts as a marketplace connecting clients with professional service providers. 
              We do not provide construction or renovation services directly.
            </p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Escrow Services</h3>
            <p>
              Payment processing and escrow services are provided to protect both clients and professionals. 
              Funds are held until job completion and client approval, or as otherwise agreed between parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Fees and Payment</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Client Fees</h3>
            <p>Clients are not charged platform fees for posting jobs or using basic features.</p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Professional Fees</h3>
            <p>
              Professionals pay a service fee on completed jobs. The standard fee is 16% for pay-as-you-go usage. 
              Subscription tiers may offer reduced fees (5% + monthly subscription).
            </p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">4.3 Payment Processing</h3>
            <p>All payments are processed securely through Stripe. Additional payment processing fees may apply.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. User Conduct</h2>
            <p>Users agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information in job postings and professional profiles</li>
              <li>Communicate professionally and respectfully</li>
              <li>Not use the platform for fraudulent or illegal activities</li>
              <li>Not attempt to bypass escrow or payment systems</li>
              <li>Not harass, abuse, or threaten other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Dispute Resolution</h2>
            <p>
              In the event of a dispute between client and professional, our admin team will review evidence from both parties 
              and make a fair determination regarding escrow fund distribution. Both parties agree to provide requested documentation 
              and cooperate with the dispute resolution process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Liability and Warranties</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">7.1 Platform Liability</h3>
            <p>
              The platform is provided "as is" without warranties. We are not liable for the quality, safety, or legality 
              of services provided by professionals, or for the accuracy of job postings.
            </p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">7.2 Professional Work</h3>
            <p>
              All construction and renovation work is performed by independent professionals. 
              Professionals are responsible for their own licenses, insurance, and compliance with local regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
            <p>
              All platform content, including logos, designs, and software, is owned by Constructive Solutions Ibiza. 
              User-generated content (job postings, profiles, reviews) remains the property of the user but grants us 
              a license to display and use such content for platform operations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms. 
              Users may close their accounts at any time, subject to completion of any active jobs and payment obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Continued use of the platform after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p>
              For questions about these terms, please contact us at: legal@constructivesolutionsibiza.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
