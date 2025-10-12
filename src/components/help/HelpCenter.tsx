import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Book, MessageCircle, Video, FileText, ExternalLink } from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    category: 'Getting Started',
    icon: Book,
    questions: [
      {
        q: 'How do I create my first task?',
        a: 'Navigate to the dashboard and click the "New Task" button. Fill in the details like title, description, and due date, then click "Create" to save your task.'
      },
      {
        q: 'How do I customize my profile?',
        a: 'Go to Settings > Profile to update your display name, bio, avatar, and other personal information. Changes are saved automatically.'
      },
      {
        q: 'What are keyboard shortcuts available?',
        a: 'Press Cmd/Ctrl + K to open the quick actions menu. From there you can navigate to any page, create new items, or access settings quickly.'
      }
    ]
  },
  {
    category: 'Features',
    icon: FileText,
    questions: [
      {
        q: 'How does AI-powered recommendations work?',
        a: 'Our AI analyzes your usage patterns, preferences, and history to provide personalized suggestions for tasks, improvements, and insights.'
      },
      {
        q: 'Can I export my data?',
        a: 'Yes! Go to Settings > Data and click "Export My Data" to download all your information in JSON format, compliant with GDPR regulations.'
      },
      {
        q: 'How do notifications work?',
        a: 'You can customize notification preferences in Settings > Notifications. Choose which events trigger notifications and how you want to receive them (in-app, email, etc.).'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    icon: MessageCircle,
    questions: [
      {
        q: 'How is my data protected?',
        a: 'We use industry-standard encryption, secure authentication, and follow GDPR compliance. All data is encrypted at rest and in transit.'
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes, you can request account deletion from Settings > Data > Delete My Data. Your data will be permanently deleted within 30 days.'
      },
      {
        q: 'Who can see my information?',
        a: 'Your data is private by default. You control what information is shared and with whom through privacy settings.'
      }
    ]
  }
];

const VIDEO_TUTORIALS = [
  { title: 'Platform Overview', duration: '3:45', url: '#' },
  { title: 'Creating Your First Task', duration: '2:15', url: '#' },
  { title: 'Using Analytics Dashboard', duration: '4:30', url: '#' },
  { title: 'Keyboard Shortcuts Guide', duration: '5:00', url: '#' }
];

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = FAQ_CATEGORIES.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q =>
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Help Center</h1>
          <p className="text-muted-foreground text-lg">
            Find answers, tutorials, and guides to help you get the most out of the platform
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for help articles, tutorials, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">
              <Book className="w-4 h-4 mr-2" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="w-4 h-4 mr-2" />
              Video Tutorials
            </TabsTrigger>
            <TabsTrigger value="docs">
              <FileText className="w-4 h-4 mr-2" />
              Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(category => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="w-5 h-5" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((item, idx) => (
                        <AccordionItem key={idx} value={`item-${idx}`}>
                          <AccordionTrigger className="text-left">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No results found for "{searchQuery}"
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>
                  Step-by-step video guides to help you master the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {VIDEO_TUTORIALS.map((video, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 rounded-md bg-muted w-16 h-16 flex items-center justify-center">
                            <Video className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{video.title}</h3>
                            <p className="text-sm text-muted-foreground">{video.duration}</p>
                            <Button variant="link" className="p-0 h-auto mt-1" size="sm">
                              Watch now
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Comprehensive guides and technical documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
                    <span className="font-semibold">Features Documentation</span>
                    <span className="text-sm text-muted-foreground">
                      Complete feature list and usage guides
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
                    <span className="font-semibold">API Documentation</span>
                    <span className="text-sm text-muted-foreground">
                      Technical API reference and examples
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
                    <span className="font-semibold">Security & Privacy</span>
                    <span className="text-sm text-muted-foreground">
                      Data protection and security practices
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
                    <span className="font-semibold">Deployment Guide</span>
                    <span className="text-sm text-muted-foreground">
                      Setup and deployment instructions
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Still need help?</h3>
              <p className="text-muted-foreground">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Button size="lg">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
