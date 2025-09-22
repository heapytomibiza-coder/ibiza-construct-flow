import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfessionals } from '@/hooks/useProfessionals';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  MapPin, 
  Phone, 
  MessageCircle, 
  CheckCircle, 
  Calendar,
  Award,
  Clock,
  ArrowLeft
} from 'lucide-react';

// Use the same Professional interface from the hook
interface Professional {
  id: string;
  full_name: string | null;
  display_name: string | null;
  preferred_language: string | null;
  roles: any;
  created_at: string | null;
  updated_at: string | null;
  // Professional-specific fields (may be null if not set)
  bio?: string | null;
  specializations?: string[] | null;
  experience_years?: number | null;
  hourly_rate?: number | null;
  location?: string | null;
  profile_image_url?: string | null;
  phone?: string | null;
  rating?: number | null;
  total_jobs_completed?: number | null;
  total_reviews?: number | null;
  availability_status?: string | null;
  verification_status?: string | null;
}

export default function ProfessionalProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProfessionalById } = useProfessionals();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProfessional();
    }
  }, [id]);

  const loadProfessional = async () => {
    if (!id) return;
    
    setLoading(true);
    const data = await getProfessionalById(id);
    setProfessional(data);
    setLoading(false);
  };

  const handleContact = () => {
    if (professional?.phone) {
      window.open(`tel:${professional.phone}`, '_self');
    }
  };

  const handleMessage = () => {
    // TODO: Implement messaging system
    console.log('Message professional');
  };

  const handleBookNow = () => {
    navigate('/services');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Professional Not Found</h2>
        <Button onClick={() => navigate('/professionals')}>
          Back to Professionals
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/professionals')}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Professionals
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Profile Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Professional Header */}
              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative">
                      <img
                        src={professional.profile_image_url || '/placeholder.svg'}
                        alt={professional.full_name}
                        className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
                      />
                      {professional.verification_status === 'verified' && (
                        <CheckCircle className="absolute -top-2 -right-2 w-8 h-8 text-green-500 bg-white rounded-full" />
                      )}
                    </div>
                    
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h1 className="text-3xl font-bold">{professional.full_name || 'Professional'}</h1>
                      <div className="flex items-center justify-center md:justify-start gap-1 mt-2 md:mt-0">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{professional.rating || 5.0}</span>
                        <span className="text-muted-foreground">({professional.total_reviews || 0} reviews)</span>
                      </div>
                    </div>
                    
                    {professional.location && (
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{professional.location}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      {Array.isArray(professional.specializations) && professional.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                      {(!professional.specializations || !Array.isArray(professional.specializations) || professional.specializations.length === 0) && (
                        <Badge variant="secondary">General Services</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                      {professional.experience_years && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{professional.experience_years} years experience</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>{professional.total_jobs_completed || 0} jobs completed</span>
                      </div>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Section */}
              {professional.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{professional.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Experience & Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Experience & Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {professional.experience_years && (
                    <>
                      <div>
                        <h4 className="font-semibold mb-2">Years of Experience</h4>
                        <p className="text-muted-foreground">{professional.experience_years} years in the field</p>
                      </div>
                      
                      <Separator />
                    </>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(professional.specializations) && professional.specializations.map((spec) => (
                        <Badge key={spec} variant="outline">
                          {spec}
                        </Badge>
                      ))}
                      {(!professional.specializations || !Array.isArray(professional.specializations) || professional.specializations.length === 0) && (
                        <Badge variant="outline">General Services</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold">${professional.hourly_rate || 50}</div>
                    <div className="text-sm text-muted-foreground">per hour</div>
                  </div>
                  
                  {professional.phone && (
                    <Button
                      onClick={handleContact}
                      className="w-full flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call Now
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={handleMessage}
                    className="w-full flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send Message
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={handleBookNow}
                    className="w-full"
                  >
                    Book Service
                  </Button>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jobs Completed</span>
                    <span className="font-semibold">{professional.total_jobs_completed || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Reviews</span>
                    <span className="font-semibold">{professional.total_reviews || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{professional.rating || 5.0}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge 
                      variant={professional.availability_status === 'available' ? 'default' : 'secondary'}
                    >
                      {professional.availability_status || 'available'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}