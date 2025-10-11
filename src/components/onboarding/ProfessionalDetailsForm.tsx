import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Briefcase, Award, Wrench, Video, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfessionalDetailsFormProps {
  professionalId: string;
  onComplete: () => void;
}

export function ProfessionalDetailsForm({ professionalId, onComplete }: ProfessionalDetailsFormProps) {
  const [workPhilosophy, setWorkPhilosophy] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addCertification = () => {
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput('');
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!workPhilosophy.trim() || workPhilosophy.length < 20) {
      newErrors.workPhilosophy = 'Please write at least 20 characters';
    }
    if (workPhilosophy.length > 200) {
      newErrors.workPhilosophy = 'Keep it under 200 characters';
    }
    if (skills.length === 0) {
      newErrors.skills = 'Add at least one skill';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('professional_profiles')
        .update({
          work_philosophy: workPhilosophy,
          skills: skills,
          certifications: certifications.length > 0 ? certifications : null,
          video_intro_url: videoUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', professionalId);

      if (error) throw error;

      toast.success('Professional details saved');
      onComplete();
    } catch (error: any) {
      console.error('Error saving details:', error);
      toast.error('Failed to save details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Work Philosophy */}
          <div className="space-y-2">
            <Label htmlFor="workPhilosophy" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Work Philosophy <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground">(Max 200 chars)</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              What's your approach to work? What makes you stand out?
            </p>
            <Textarea
              id="workPhilosophy"
              value={workPhilosophy}
              onChange={(e) => setWorkPhilosophy(e.target.value)}
              placeholder="Quality over speed. I believe in doing things right the first time and building lasting relationships with clients..."
              rows={4}
              maxLength={200}
              className={errors.workPhilosophy ? 'border-destructive' : ''}
            />
            <div className="flex justify-between items-center">
              {errors.workPhilosophy && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.workPhilosophy}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {workPhilosophy.length}/200
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Skills & Specializations <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              What specific skills do you excel at?
            </p>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="e.g., Emergency Repairs"
                className={errors.skills ? 'border-destructive' : ''}
              />
              <Button type="button" onClick={addSkill} variant="outline">
                Add
              </Button>
            </div>
            {errors.skills && skills.length === 0 && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.skills}
              </p>
            )}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Certifications (Optional)
            </Label>
            <p className="text-sm text-muted-foreground">
              Add any relevant certifications or licenses
            </p>
            <div className="flex gap-2">
              <Input
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                placeholder="e.g., Licensed Electrician"
              />
              <Button type="button" onClick={addCertification} variant="outline">
                Add
              </Button>
            </div>
            {certifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="pl-3 pr-1 py-1">
                    {cert}
                    <button
                      onClick={() => removeCertification(cert)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Video Intro URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video Introduction (Optional)
            </Label>
            <p className="text-sm text-muted-foreground">
              YouTube or Vimeo link to introduce yourself
            </p>
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={isLoading} size="lg" className="w-full">
        {isLoading ? 'Saving...' : 'Continue to Payout Setup'}
      </Button>
    </div>
  );
}
