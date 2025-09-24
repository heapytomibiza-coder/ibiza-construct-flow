import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mic, Camera, FileText, Scan, Wifi, WifiOff,
  Play, Square, Upload, MessageSquare, Zap,
  Calculator, MapPin, Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface ToolsScreenProps {
  user: any;
}

export const ToolsScreen = ({ user }: ToolsScreenProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [queuedActions, setQueuedActions] = useState(3);

  const snippets = [
    { id: '1', category: 'Arrival', text: 'Hi! I\'ve arrived and will be starting shortly. I\'ll knock when ready to begin.' },
    { id: '2', category: 'Delay', text: 'Running about 15 minutes late due to traffic. Will message when I\'m 5 minutes away.' },
    { id: '3', category: 'Completion', text: 'Work completed! Please take a look and let me know if you have any questions.' },
    { id: '4', category: 'Aftercare', text: 'Thanks for choosing my services! Here are some maintenance tips for your new installation...' }
  ];

  const handleVoiceToQuote = async () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.success('Recording started - describe the job requirements');
      
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false);
        toast.success('Quote generated from voice description!');
      }, 3000);
    } else {
      setIsRecording(false);
      toast.info('Recording stopped');
    }
  };

  const handlePhotoToQuote = () => {
    toast.info('Camera opened - take photos of the work area');
  };

  const handleMaterialsScanner = () => {
    toast.info('Invoice scanner opened - snap a photo of your receipt');
  };

  const handleSnippetInsert = (snippet: any) => {
    toast.success(`Inserted: "${snippet.text.substring(0, 30)}..."`);
  };

  const toggleOfflineMode = () => {
    setIsOffline(!isOffline);
    if (!isOffline) {
      toast.info('Offline mode enabled - actions will queue for sync');
    } else {
      toast.success('Back online - syncing queued actions');
      setQueuedActions(0);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Voice to Quote */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Voice to Quote
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe the job verbally and get instant line items and estimates
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 border-2 border-dashed rounded-lg text-center ${
            isRecording ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}>
            <Button 
              size="lg"
              variant={isRecording ? 'destructive' : 'default'}
              onClick={handleVoiceToQuote}
              className="mb-2"
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              {isRecording ? 'Listening... Describe the job requirements' : 'Tap to start voice description'}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h4 className="font-medium text-sm mb-1">Sample Voice Commands</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• "Install 15 square meters of ceramic tiles with grout"</li>
              <li>• "Repair leaking pipe behind bathroom wall"</li>
              <li>• "Mount 6 kitchen cabinets and connect plumbing"</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Photo to Quote */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Photo to Quote
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload photos of the work area for AI-powered scope analysis
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full h-16 border-dashed"
            onClick={handlePhotoToQuote}
          >
            <Camera className="w-6 h-6 mr-2" />
            Take Photos for Analysis
          </Button>
          
          <div className="mt-3 text-xs text-muted-foreground">
            <p>💡 Best results: Take photos from multiple angles showing the full scope of work</p>
          </div>
        </CardContent>
      </Card>

      {/* Materials Scanner */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scan className="w-4 h-4" />
            Materials Scanner
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Scan receipts to automatically track job materials and costs
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full h-12"
            onClick={handleMaterialsScanner}
          >
            <Scan className="w-4 h-4 mr-2" />
            Scan Invoice/Receipt
          </Button>
          
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
            <strong>OCR Magic:</strong> Automatically extracts item names, quantities, and costs from receipts
          </div>
        </CardContent>
      </Card>

      {/* Quick Snippets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Quick Snippets
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pre-written messages for common situations
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {snippets.map((snippet) => (
            <div key={snippet.id} className="border rounded p-3">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-xs">{snippet.category}</Badge>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleSnippetInsert(snippet)}
                >
                  Insert
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{snippet.text}</p>
            </div>
          ))}
          
          <Button variant="outline" className="w-full">
            <MessageSquare className="w-4 h-4 mr-2" />
            Manage Snippets
          </Button>
        </CardContent>
      </Card>

      {/* Offline Mode */}
      <Card className={isOffline ? 'bg-orange-50 border-orange-200' : ''}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            Offline Mode
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Continue working without internet - actions sync when back online
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <h4 className="font-medium text-sm">Offline Capability</h4>
              <p className="text-xs text-muted-foreground">
                Photos, messages, and updates queue automatically
              </p>
            </div>
            <Button 
              variant={isOffline ? 'default' : 'outline'}
              onClick={toggleOfflineMode}
            >
              {isOffline ? 'Go Online' : 'Test Offline'}
            </Button>
          </div>

          {isOffline && queuedActions > 0 && (
            <div className="p-3 bg-orange-100 border border-orange-200 rounded">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">{queuedActions} actions queued for sync</span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                Photos and updates will sync automatically when connection returns
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Calculators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Quick Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 flex-col">
            <Calculator className="w-4 h-4 mb-1" />
            <span className="text-xs">Area Calculator</span>
          </Button>
          
          <Button variant="outline" className="h-12 flex-col">
            <MapPin className="w-4 h-4 mb-1" />
            <span className="text-xs">Travel Cost</span>
          </Button>
          
          <Button variant="outline" className="h-12 flex-col">
            <Clock className="w-4 h-4 mb-1" />
            <span className="text-xs">Time Tracker</span>
          </Button>
          
          <Button variant="outline" className="h-12 flex-col">
            <Zap className="w-4 h-4 mb-1" />
            <span className="text-xs">Markup Helper</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};