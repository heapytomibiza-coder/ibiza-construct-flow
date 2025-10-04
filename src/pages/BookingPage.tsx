import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SimpleBookingForm } from '@/components/booking/SimpleBookingForm';

const BookingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Request Your Services</h1>
            <p className="text-muted-foreground">
              Fill in your details and we'll connect you with the professionals
            </p>
          </div>
          
          <SimpleBookingForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
