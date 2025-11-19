import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Check, Download, FileText } from 'lucide-react';
import { DEMO_STATS, VIDEO_SECTIONS } from '@/lib/demoData';

const DemoVideoGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Video className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Demo Video Setup</span>
            </div>
            
            <h1 className="text-4xl font-bold">Platform Demo Video Guide</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create a professional demo video showcasing TM Direct's features
            </p>
          </div>

          {/* Platform Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Platform Statistics</CardTitle>
              <CardDescription>Sample metrics included in demo mode</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{DEMO_STATS.totalServices}</div>
                  <div className="text-sm text-muted-foreground">Services</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{DEMO_STATS.activeProviders}</div>
                  <div className="text-sm text-muted-foreground">Providers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{DEMO_STATS.completedBookings.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{DEMO_STATS.averageRating}</div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{DEMO_STATS.responseTime}</div>
                  <div className="text-sm text-muted-foreground">Response</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Structure */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Video Structure (8-12 minutes)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {VIDEO_SECTIONS.map((section, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription>{section.duration}</CardDescription>
                      </div>
                      <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recording Tips */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Recording Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Technical Setup</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 1920x1080 resolution minimum</li>
                    <li>• 30 FPS for smooth motion</li>
                    <li>• Clear voiceover narration</li>
                    <li>• Smooth transitions between sections</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Content Focus</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Highlight dual marketplace</li>
                    <li>• Show intelligent systems</li>
                    <li>• Demonstrate ease of use</li>
                    <li>• Emphasize trust & safety</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2">
              <FileText className="w-5 h-5" />
              View Full Script
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Download className="w-5 h-5" />
              Download Checklist
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemoVideoGuide;
