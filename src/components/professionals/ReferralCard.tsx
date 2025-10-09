import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Copy, Mail, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ReferralCardProps {
  professionalId: string;
  professionalName: string;
}

export const ReferralCard = ({
  professionalId,
  professionalName
}: ReferralCardProps) => {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  
  const referralLink = `${window.location.origin}/professionals/${professionalId}?ref=share`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    // In production, this would send via an API
    const subject = `Check out ${professionalName} on our platform`;
    const body = `I thought you might be interested in ${professionalName}'s services.\n\nView their profile: ${referralLink}`;
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success('Opening email client...');
    setEmail('');
  };

  return (
    <Card className="card-luxury border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Refer a Friend
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Know someone who could benefit from {professionalName}'s services? Share their profile!
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Link */}
        <div>
          <label className="text-sm font-medium block mb-2">
            Share Link
          </label>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="flex-1 font-mono text-xs"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="touch-target"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Email Referral */}
        <div>
          <label className="text-sm font-medium block mb-2">
            Email to a Friend
          </label>
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              className="flex-1 mobile-optimized-input"
            />
            <Button
              onClick={handleSendEmail}
              className="touch-target"
            >
              <Mail className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-3">Quick Share</p>
          <div className="flex flex-wrap gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
                    '_blank',
                    'width=600,height=400'
                  );
                }}
                className="touch-target"
              >
                Facebook
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Check out ${professionalName}`)}`,
                    '_blank',
                    'width=600,height=400'
                  );
                }}
                className="touch-target"
              >
                Twitter
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
                    '_blank',
                    'width=600,height=400'
                  );
                }}
                className="touch-target"
              >
                LinkedIn
              </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
