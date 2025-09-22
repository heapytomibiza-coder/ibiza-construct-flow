import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Wrench } from 'lucide-react';

export default function RoleSelect() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Our Platform
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose how you'd like to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Client/Asker Card */}
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">I need work done</CardTitle>
              <CardDescription className="text-lg">
                Find professionals for your projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 text-center">
                Post your projects, get matched with qualified professionals, and manage your work from start to finish.
              </p>
              <Link to="/auth/sign-up?role=client" className="block">
                <Button size="lg" className="w-full">
                  Get Started as Client
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Professional/Tasker Card */}
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">I'm a professional</CardTitle>
              <CardDescription className="text-lg">
                Offer my services and grow my business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 text-center">
                Connect with clients, showcase your skills, and build your reputation on our trusted platform.
              </p>
              <Link to="/auth/sign-up?role=professional" className="block">
                <Button size="lg" className="w-full" variant="secondary">
                  Get Started as Professional
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link to="/auth/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}