import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CookiePolicy = () => {
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

        <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit our website. 
              They help us provide and improve our services, remember your preferences, and understand how you use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>

            <h3 className="text-xl font-semibold mt-4 mb-2">2.1 Essential Cookies (Required)</h3>
            <p>These cookies are necessary for the platform to function and cannot be disabled:</p>
            <div className="bg-muted p-4 rounded-lg mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Cookie Name</th>
                    <th className="text-left py-2 pr-4">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono">sb-access-token</td>
                    <td className="py-2 pr-4">User authentication</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono">sb-refresh-token</td>
                    <td className="py-2 pr-4">Session management</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono">cookie-consent</td>
                    <td className="py-2 pr-4">Stores your cookie preferences</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-2">2.2 Analytics Cookies (Optional)</h3>
            <p>With your consent, we use these cookies to understand usage patterns and improve the platform:</p>
            <div className="bg-muted p-4 rounded-lg mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Cookie Name</th>
                    <th className="text-left py-2 pr-4">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono">_ga</td>
                    <td className="py-2 pr-4">Google Analytics - distinguish users</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono">_ga_*</td>
                    <td className="py-2 pr-4">Google Analytics - session persistence</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono">_gid</td>
                    <td className="py-2 pr-4">Google Analytics - distinguish users</td>
                    <td className="py-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Analytics cookies are only activated if you accept them via the cookie banner. 
              You can withdraw consent at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Third-Party Cookies</h2>
            <p>We use services from trusted third parties that may set their own cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Stripe:</strong> Payment processing (see{' '}
                <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Stripe's cookie policy
                </a>)
              </li>
              <li>
                <strong>Google Analytics:</strong> Usage analytics (only with consent)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Managing Your Cookie Preferences</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Cookie Banner</h3>
            <p>
              When you first visit our platform, you'll see a cookie consent banner. 
              You can accept all cookies or customize your preferences to accept only essential cookies.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Browser Settings</h3>
            <p>
              You can also manage cookies through your browser settings. Note that disabling essential cookies 
              may affect platform functionality.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Edge
                </a>
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">4.3 Withdrawing Consent</h3>
            <p>
              You can change your cookie preferences at any time by clicking the "Cookie Settings" link 
              in our footer or contacting us at privacy@constructivesolutionsibiza.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy to reflect changes in our practices or legal requirements. 
              The "Last updated" date at the top indicates when changes were last made.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contact</h2>
            <p>
              For questions about cookies or privacy:<br />
              Email: privacy@constructivesolutionsibiza.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
