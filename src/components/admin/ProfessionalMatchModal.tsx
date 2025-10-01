import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Loader2,
  MessageSquare,
  Send
} from 'lucide-react';
import { professionalMatching } from '@/lib/api/professional-matching';

interface ProfessionalMatch {
  professional: {
    id: string;
    name: string;
    rating: number;
    skills: string[];
    hourly_rate: number;
    location: string;
    availability: string;
    experience_years: number;
  };
  matchScore: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
}

interface ProfessionalMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  jobDescription: string;
}

export default function ProfessionalMatchModal({ 
  isOpen, 
  onClose, 
  jobId, 
  jobTitle, 
  jobDescription 
}: ProfessionalMatchModalProps) {
  const [matches, setMatches] = useState<ProfessionalMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleFindProfessionals = async () => {
    setIsLoading(true);
    try {
      const response = await professionalMatching.matchProfessionals({
        jobRequirements: {
          title: jobTitle,
          description: jobDescription,
          skills: []
        },
        location: 'general',
        budget: 1000,
        urgency: 'normal'
      });

      // Parse AI response and convert to matches format
      const aiMatches = response.matches || [];
      const formattedMatches: ProfessionalMatch[] = aiMatches.map((match) => ({
        professional: {
          id: match.professionalId,
          name: match.name,
          rating: 4.5,
          skills: match.strengths,
          hourly_rate: 45,
          location: 'Local Area',
          availability: 'Available',
          experience_years: 5
        },
        matchScore: Math.round(match.matchScore * 100),
        reasoning: match.explanation,
        strengths: match.strengths,
        concerns: match.concerns
      }));

      setMatches(formattedMatches);
    } catch (error) {
      console.error('Error finding professionals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvitation = async (professionalId: string) => {
    setIsSending(true);
    try {
      // TODO: Integrate with communications API when available
      console.log('Sending invitation to professional:', professionalId);
      console.log('Job details:', { jobTitle, jobDescription });
      // Placeholder for future communications integration
    } catch (error) {
      console.error('Error drafting invitation:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            AI Professional Matching
          </DialogTitle>
          <DialogDescription>
            Find the best professionals for "{jobTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <Button 
                onClick={handleFindProfessionals} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finding Professionals...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Find Best Professionals
                  </>
                )}
              </Button>
              <p className="text-muted-foreground text-sm">
                AI will analyze skills, location, availability, and performance to suggest the best matches
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {matches.map((match, index) => (
                <Card key={match.professional.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {match.professional.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{match.professional.name}</h4>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-muted-foreground">
                                {match.professional.rating}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {match.professional.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {match.professional.experience_years} years exp
                            </div>
                            <span className="font-medium text-foreground">
                              €{match.professional.hourly_rate}/hr
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {match.professional.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {match.reasoning}
                          </p>
                          
                          {match.strengths.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-green-600 mb-1">Strengths:</p>
                              <div className="flex flex-wrap gap-1">
                                {match.strengths.map((strength, i) => (
                                  <Badge key={i} variant="outline" className="text-xs text-green-600 border-green-200">
                                    <CheckCircle className="h-2 w-2 mr-1" />
                                    {strength}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">Match Score</span>
                            <span className={`text-lg font-bold ${getMatchScoreColor(match.matchScore)}`}>
                              {match.matchScore}%
                            </span>
                          </div>
                          <Progress value={match.matchScore} className="w-20" />
                        </div>
                        
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleSendInvitation(match.professional.id)}
                            disabled={isSending}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleSendInvitation(match.professional.id)}
                            disabled={isSending}
                          >
                            {isSending ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3 mr-1" />
                            )}
                            Invite
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}