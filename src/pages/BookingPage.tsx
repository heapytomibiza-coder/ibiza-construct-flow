import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BookingPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Find & Book Services</h1>
            <p className="text-muted-foreground">
              Browse our marketplace to find professionals and request quotes
            </p>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-lg">
                Our new streamlined booking process makes it easier to connect with professionals.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/discovery')} size="lg" className="bg-gradient-hero">
                  Browse Services
                </Button>
                <Button onClick={() => navigate('/professionals')} variant="outline" size="lg">
                  Find Professionals
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
