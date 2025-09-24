import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Clock, DollarSign, Star, 
  ChevronLeft, ChevronRight, Heart, X,
  MessageSquare, Zap, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface LeadsScreenProps {
  user: any;
}

export const LeadsScreen = ({ user }: LeadsScreenProps) => {
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [savedLeads, setSavedLeads] = useState<string[]>([]);

  const leads = [
    {
      id: '1',
      title: 'Kitchen Renovation - Full Remodel',
      description: 'Complete kitchen renovation including cabinets, countertops, appliances, and flooring. Modern design with island.',
      category: 'Home Improvement',
      subcategory: 'Kitchen',
      micro: 'Full Renovation',
      budget: '€8,000 - €12,000',
      location: 'Dublin City Centre',
      distance: '2.3 km',
      timeMatch: 'Next week',
      clientRating: 4.8,
      clientJobs: 12,
      urgency: 'medium',
      fitScore: 92,
      fitReasons: ['10 min away', '95% skills match', 'fits availability', 'repeat client area'],
      posted: '2 hours ago',
      questions: [
        'Do you have parking available?',
        'Are materials included in quote?',
        'Timeline flexibility?'
      ]
    },
    {
      id: '2',
      title: 'Bathroom Plumbing Repair',
      description: 'Leaking pipe behind wall, possible water damage assessment needed. Urgent repair required.',
      category: 'Maintenance',
      subcategory: 'Plumbing',
      micro: 'Emergency Repair',
      budget: '€200 - €500',
      location: 'Rathmines',
      distance: '4.1 km',
      timeMatch: 'Today/Tomorrow',
      clientRating: 4.2,
      clientJobs: 3,
      urgency: 'high',
      fitScore: 88,
      fitReasons: ['Emergency specialist', 'Available today', 'High success rate'],
      posted: '30 minutes ago',
      questions: [
        'Can you come today?',
        'Do you handle water damage?',
        'Insurance documentation?'
      ]
    },
    {
      id: '3',
      title: 'Garden Landscaping Project',
      description: 'Small back garden transformation. Includes decking, plant borders, and lighting installation.',
      category: 'Outdoor',
      subcategory: 'Landscaping',
      micro: 'Garden Design',
      budget: '€2,500 - €4,000',
      location: 'Blackrock',
      distance: '8.7 km',
      timeMatch: 'Next month',
      clientRating: 5.0,
      clientJobs: 1,
      urgency: 'low',
      fitScore: 76,
      fitReasons: ['Skills match', 'Good budget range', 'New client opportunity'],
      posted: '1 day ago',
      questions: [
        'Experience with outdoor lighting?',
        'Portfolio examples?',
        'Maintenance included?'
      ]
    }
  ];

  const currentLead = leads[currentLeadIndex];

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (direction === 'left') {
      // Skip
      toast.info('Lead skipped');
      nextLead();
    } else if (direction === 'right') {
      // Quote
      handleQuote();
    } else if (direction === 'up') {
      // Save
      handleSave();
    }
  };

  const handleQuote = () => {
    toast.success('Quote composer opened');
    // This would open the quote composer
  };

  const handleSave = () => {
    setSavedLeads(prev => [...prev, currentLead.id]);
    toast.success('Lead saved for later');
    nextLead();
  };

  const handleAskQuestion = (question: string) => {
    toast.info(`Sent: "${question}"`);
  };

  const nextLead = () => {
    if (currentLeadIndex < leads.length - 1) {
      setCurrentLeadIndex(currentLeadIndex + 1);
    } else {
      toast.info('No more leads available');
    }
  };

  const prevLead = () => {
    if (currentLeadIndex > 0) {
      setCurrentLeadIndex(currentLeadIndex - 1);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getFitScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">New Leads</h2>
          <p className="text-sm text-muted-foreground">
            {currentLeadIndex + 1} of {leads.length} • Swipe to navigate
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prevLead} disabled={currentLeadIndex === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextLead} disabled={currentLeadIndex === leads.length - 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Lead Card */}
      <Card className="relative min-h-[500px]">
        {/* Fit Score Badge */}
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="secondary" className={`${getFitScoreColor(currentLead.fitScore)} font-bold`}>
            {currentLead.fitScore}% fit
          </Badge>
        </div>

        {/* Urgency Indicator */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${getUrgencyColor(currentLead.urgency)}`}></div>

        <CardHeader className="pb-3">
          <CardTitle className="text-lg pr-20">{currentLead.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{currentLead.category} • {currentLead.micro}</span>
            <span>Posted {currentLead.posted}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm">{currentLead.description}</p>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium">{currentLead.budget}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{currentLead.location} • {currentLead.distance}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>{currentLead.timeMatch}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-600" />
                <span>{currentLead.clientRating} • {currentLead.clientJobs} jobs</span>
              </div>
            </div>
          </div>

          {/* Fit Reasons */}
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Why this fits
            </h4>
            <div className="flex flex-wrap gap-1">
              {currentLead.fitReasons.map((reason, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>

          {/* Auto-Ask Questions */}
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Quick questions
            </h4>
            <div className="space-y-2">
              {currentLead.questions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 justify-start"
                  onClick={() => handleAskQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1 flex items-center gap-2"
              onClick={() => handleSwipe('left')}
            >
              <X className="w-4 h-4" />
              Skip
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handleSwipe('up')}
            >
              <Heart className="w-4 h-4" />
              Save
            </Button>
            <Button 
              className="flex-1 flex items-center gap-2 bg-primary"
              onClick={() => handleSwipe('right')}
            >
              <CheckCircle2 className="w-4 h-4" />
              Quote in 10s
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Swipe Instructions */}
      <div className="text-center text-xs text-muted-foreground">
        ← Skip • ↑ Save • → Quote
      </div>

      {/* Saved Counter */}
      {savedLeads.length > 0 && (
        <div className="text-center">
          <Badge variant="secondary">
            {savedLeads.length} leads saved
          </Badge>
        </div>
      )}
    </div>
  );
};