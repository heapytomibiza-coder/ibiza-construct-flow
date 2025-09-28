import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, HelpCircle, DollarSign, CheckCircle, 
  Search, PlusCircle, ArrowRight 
} from 'lucide-react';

interface QuestionnaireResult {
  recommendedPath: 'browse' | 'post';
  confidence: number;
  reasons: string[];
  context: {
    urgency: string;
    clarity: string;
    budget: string;
  };
}

interface QuickQuestionnaireProps {
  onComplete: (result: QuestionnaireResult) => void;
  onSkip: () => void;
}

export const QuickQuestionnaire: React.FC<QuickQuestionnaireProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    urgency: '',
    clarity: '',
    budget: ''
  });

  const questions = [
    {
      id: 'urgency',
      title: 'How urgent is your project?',
      icon: <Clock className="w-5 h-5" />,
      options: [
        { 
          value: 'now', 
          label: 'Need someone today/tomorrow', 
          desc: 'Urgent fix or immediate help needed',
          leansBrowse: true
        },
        { 
          value: 'soon', 
          label: 'Within this week', 
          desc: 'Planning ahead but need to start soon',
          leansBrowse: true
        },
        { 
          value: 'planning', 
          label: 'Planning for later', 
          desc: 'Comparing options and getting quotes',
          leansPost: true
        }
      ]
    },
    {
      id: 'clarity',
      title: 'How clear are your requirements?',
      icon: <HelpCircle className="w-5 h-5" />,
      options: [
        { 
          value: 'clear', 
          label: 'I know exactly what I need', 
          desc: 'Have specific requirements and scope',
          leansBrowse: true
        },
        { 
          value: 'mostly', 
          label: 'I have a good idea', 
          desc: 'Know the basics but might need guidance',
          neutral: true
        },
        { 
          value: 'unclear', 
          label: 'I need help defining it', 
          desc: 'Want professional advice and multiple approaches',
          leansPost: true
        }
      ]
    },
    {
      id: 'budget',
      title: 'What\'s your approach to budget?',
      icon: <DollarSign className="w-5 h-5" />,
      options: [
        { 
          value: 'fixed', 
          label: 'I have a specific budget in mind', 
          desc: 'Know what I can spend',
          leansBrowse: true
        },
        { 
          value: 'flexible', 
          label: 'I want to see different options', 
          desc: 'Open to various price points',
          neutral: true
        },
        { 
          value: 'compare', 
          label: 'I want to compare quotes', 
          desc: 'Need multiple options to decide',
          leansPost: true
        }
      ]
    }
  ];

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate recommendation
      const result = calculateRecommendation(newAnswers);
      onComplete(result);
    }
  };

  const calculateRecommendation = (formAnswers: { urgency: string; clarity: string; budget: string }): QuestionnaireResult => {
    const currentQuestion = questions.find(q => q.id === 'urgency');
    const urgencyOption = currentQuestion?.options.find(opt => opt.value === formAnswers.urgency);
    
    const clarityQuestion = questions.find(q => q.id === 'clarity');
    const clarityOption = clarityQuestion?.options.find(opt => opt.value === formAnswers.clarity);
    
    const budgetQuestion = questions.find(q => q.id === 'budget');
    const budgetOption = budgetQuestion?.options.find(opt => opt.value === formAnswers.budget);

    let browseScore = 0;
    let postScore = 0;
    const reasons: string[] = [];

    // Score based on answers
    if (urgencyOption?.leansBrowse) {
      browseScore += 2;
      reasons.push('Urgent projects work better with direct professional booking');
    }
    if (urgencyOption?.leansPost) {
      postScore += 1;
      reasons.push('Planning ahead gives time to compare multiple offers');
    }

    if (clarityOption?.leansBrowse) {
      browseScore += 2;
      reasons.push('Clear requirements make it easy to find the right professional');
    }
    if (clarityOption?.leansPost) {
      postScore += 2;
      reasons.push('Professionals can help define and scope unclear projects');
    }

    if (budgetOption?.leansBrowse) {
      browseScore += 1;
      reasons.push('Fixed budgets work well with transparent professional pricing');
    }
    if (budgetOption?.leansPost) {
      postScore += 2;
      reasons.push('Multiple quotes help you compare value and approaches');
    }

    const recommendedPath = browseScore > postScore ? 'browse' : 'post';
    const maxScore = Math.max(browseScore, postScore);
    const totalScore = browseScore + postScore;
    const confidence = totalScore > 0 ? Math.round((maxScore / totalScore) * 100) : 50;

    return {
      recommendedPath,
      confidence,
      reasons: reasons.slice(0, 2), // Top 2 reasons
      context: formAnswers
    };
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = questions[currentStep];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Quick Path Finder
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Answer 3 quick questions to get the best experience
        </p>
        
        {/* Progress bar */}
        <div className="flex gap-2 mt-4">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {currentQuestion.icon}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {currentQuestion.title}
          </h3>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              className="w-full p-4 h-auto text-left justify-start hover:bg-primary/5 hover:border-primary"
              onClick={() => handleAnswer(currentQuestion.id, option.value)}
            >
              <div className="flex-1">
                <div className="font-medium mb-1">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          {currentStep > 0 ? (
            <Button variant="ghost" onClick={goBack}>
              Back
            </Button>
          ) : (
            <div />
          )}
          
          <Button variant="ghost" onClick={onSkip}>
            Skip questionnaire
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};