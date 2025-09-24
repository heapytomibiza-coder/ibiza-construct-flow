import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageSquare, 
  Loader2, 
  Copy, 
  Send, 
  Sparkles,
  Mail,
  Phone,
  Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CommunicationsDrafterModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: {
    type: 'job_broadcast' | 'status_update' | 'welcome' | 'reminder' | 'custom';
    recipients: string[];
    data: any;
  };
}

interface DraftedCommunication {
  subject: string;
  body: string;
  fullDraft: string;
  tone: string;
  communicationType: string;
}

export default function CommunicationsDrafterModal({ 
  isOpen, 
  onClose, 
  context 
}: CommunicationsDrafterModalProps) {
  const [draftedComm, setDraftedComm] = useState<DraftedCommunication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [customContext, setCustomContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [commType, setCommType] = useState(context.type);
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [newKeyPoint, setNewKeyPoint] = useState('');
  const { toast } = useToast();

  const handleDraftCommunication = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-communications-drafter', {
        body: {
          communicationType: commType,
          recipient: context.recipients[0] || 'general',
          context: {
            ...context.data,
            customContext,
            recipients: context.recipients
          },
          tone,
          keyPoints: keyPoints.length > 0 ? keyPoints : getDefaultKeyPoints()
        }
      });

      if (error) throw error;

      setDraftedComm({
        subject: data.subject || 'Communication Draft',
        body: data.body || data.fullDraft || 'Draft content generated',
        fullDraft: data.fullDraft || data.body || 'Draft content generated',
        tone,
        communicationType: commType
      });
    } catch (error) {
      console.error('Error drafting communication:', error);
      toast({
        title: "Error",
        description: "Failed to draft communication. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultKeyPoints = () => {
    switch (commType) {
      case 'job_broadcast':
        return ['New job opportunity', 'Skills required', 'Competitive compensation'];
      case 'status_update':
        return ['Status change', 'Next steps', 'Timeline update'];
      case 'welcome':
        return ['Welcome message', 'Platform overview', 'Getting started'];
      case 'reminder':
        return ['Action required', 'Deadline', 'Contact information'];
      default:
        return ['Important information', 'Call to action'];
    }
  };

  const handleAddKeyPoint = () => {
    if (newKeyPoint.trim() && !keyPoints.includes(newKeyPoint.trim())) {
      setKeyPoints([...keyPoints, newKeyPoint.trim()]);
      setNewKeyPoint('');
    }
  };

  const removeKeyPoint = (point: string) => {
    setKeyPoints(keyPoints.filter(p => p !== point));
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard"
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSendCommunication = async () => {
    if (!draftedComm) return;
    
    setIsSending(true);
    try {
      // Here you would integrate with your actual communication system
      // For now, we'll just simulate sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sent!",
        description: `Communication sent to ${context.recipients.length} recipient(s)`
      });
      
      onClose();
    } catch (error) {
      console.error('Error sending communication:', error);
      toast({
        title: "Error",
        description: "Failed to send communication. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'job_broadcast':
        return <Bell className="h-4 w-4" />;
      case 'status_update':
        return <MessageSquare className="h-4 w-4" />;
      case 'welcome':
        return <Mail className="h-4 w-4" />;
      case 'reminder':
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Communications Drafter
          </DialogTitle>
          <DialogDescription>
            Generate professional communications with AI assistance
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
          {/* Configuration Panel */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Communication Type</Label>
              <Select value={commType} onValueChange={(value) => setCommType(value as typeof commType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job_broadcast">Job Broadcast</SelectItem>
                  <SelectItem value="status_update">Status Update</SelectItem>
                  <SelectItem value="welcome">Welcome Message</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recipients ({context.recipients.length})</Label>
              <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[2.5rem] bg-muted/50">
                {context.recipients.slice(0, 3).map((recipient, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {recipient}
                  </Badge>
                ))}
                {context.recipients.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{context.recipients.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Key Points</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add key point..."
                    value={newKeyPoint}
                    onChange={(e) => setNewKeyPoint(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyPoint()}
                  />
                  <Button onClick={handleAddKeyPoint} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {keyPoints.map((point, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs cursor-pointer"
                      onClick={() => removeKeyPoint(point)}
                    >
                      {point} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Context</Label>
              <Textarea
                placeholder="Add any specific context or requirements..."
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleDraftCommunication} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Drafting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Draft Communication
                </>
              )}
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label>Preview</Label>
              {draftedComm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getCommunicationIcon(draftedComm.communicationType)}
                  {draftedComm.tone}
                </Badge>
              )}
            </div>

            {draftedComm ? (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Subject</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard(draftedComm.subject)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="font-medium">{draftedComm.subject}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Message Body</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard(draftedComm.body)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-md max-h-64 overflow-y-auto">
                      <div className="whitespace-pre-wrap text-sm">
                        {draftedComm.body}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handleCopyToClipboard(draftedComm.fullDraft)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                    <Button
                      onClick={handleSendCommunication}
                      disabled={isSending}
                      className="flex-1"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Configure your communication settings and click "Draft Communication" to generate content
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}