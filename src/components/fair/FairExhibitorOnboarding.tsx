/**
 * Fair Exhibitor Onboarding Flow
 * Quick 3-step wizard for exhibitors to create profiles at the fair
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Check, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const step1Schema = z.object({
  sectorSlug: z.string().min(1, 'Selecciona un sector'),
  companyName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Teléfono inválido'),
  whatsapp: z.string().optional(),
  tagline: z.string().min(10, 'Mínimo 10 caracteres').max(150, 'Máximo 150 caracteres'),
});

const step2Schema = z.object({
  services: z.array(z.string()).min(1, 'Selecciona al menos un servicio'),
  specializations: z.array(z.string()).min(1, 'Añade al menos una especialización'),
  idealClients: z.string().min(20, 'Describe tus clientes ideales'),
  usp1: z.string().min(5, 'Mínimo 5 caracteres'),
  usp2: z.string().min(5, 'Mínimo 5 caracteres'),
  usp3: z.string().min(5, 'Mínimo 5 caracteres'),
  areasIbizaNorte: z.boolean().optional(),
  areasIbizaSur: z.boolean().optional(),
  areasFormentera: z.boolean().optional(),
});

const step3Schema = z.object({
  yearsInIbiza: z.number().min(0).max(100),
  teamSize: z.number().min(1).max(1000),
  emergencyService: z.boolean().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

export default function FairExhibitorOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      sectorSlug: '',
      companyName: '',
      email: '',
      phone: '',
      whatsapp: '',
      tagline: '',
    },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      services: [],
      specializations: [],
      idealClients: '',
      usp1: '',
      usp2: '',
      usp3: '',
    },
  });

  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      yearsInIbiza: 5,
      teamSize: 5,
      emergencyService: false,
    },
  });

  // Fetch sectors for dropdown
  const { data: sectors } = useQuery({
    queryKey: ['fair-sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fair_sectors')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (data: Step1Data & Step2Data & Step3Data) => {
      // In a real implementation, this would:
      // 1. Create auth user
      // 2. Create profile
      // 3. Create professional_profile with all data
      // 4. Send welcome email
      
      // For now, just simulate
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast.success('¡Perfil creado con éxito!', {
        description: 'Revisa tu email para acceder a tu cuenta.',
      });
    },
    onError: () => {
      toast.error('Error al crear el perfil', {
        description: 'Por favor, inténtalo de nuevo.',
      });
    },
  });

  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const onStep2Submit = (data: Step2Data) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  const onStep3Submit = (data: Step3Data) => {
    if (step1Data && step2Data) {
      createProfileMutation.mutate({ ...step1Data, ...step2Data, ...data });
    }
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4">Ibiza Home Meeting 2025</Badge>
          <h1 className="text-4xl font-bold mb-2">Crea Tu Perfil</h1>
          <p className="text-muted-foreground">3 pasos rápidos para unirte a la plataforma</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Paso {currentStep} de 3</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
        </div>

        {/* Step 1: Company Basics */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos esenciales de tu empresa (2 minutos)</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form1}>
                <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-6">
                  <FormField
                    control={form1.control}
                    name="sectorSlug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tu sector" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sectors?.map(sector => (
                              <SelectItem key={sector.slug} value={sector.slug}>
                                {sector.name_es}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form1.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Empresa *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Construcciones Ibiza" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form1.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="info@empresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form1.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono *</FormLabel>
                          <FormControl>
                            <Input placeholder="+34 600 000 000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form1.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="+34 600 000 000" {...field} />
                        </FormControl>
                        <FormDescription>Si es diferente al teléfono</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form1.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frase de Presentación *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Una frase que describa lo que haces..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Máximo 150 caracteres</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" size="lg">
                    Continuar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Services & Expertise */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Servicios y Especialidades</CardTitle>
              <CardDescription>¿Qué ofreces y a quién? (3 minutos)</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form2}>
                <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-6">
                  <FormField
                    control={form2.control}
                    name="idealClients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clientes Ideales *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe el tipo de clientes con los que trabajas mejor..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel>Puntos Únicos de Venta *</FormLabel>
                    <FormField
                      control={form2.control}
                      name="usp1"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="1. Ej: Un solo interlocutor para toda la obra" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form2.control}
                      name="usp2"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="2. Ej: Equipo estable todo el año" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form2.control}
                      name="usp3"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="3. Ej: Presupuestos claros" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Atrás
                    </Button>
                    <Button type="submit" className="flex-1">
                      Continuar
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Profile Enhancement */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Detalles Finales</CardTitle>
              <CardDescription>Información adicional (opcional, 2 minutos)</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form3}>
                <form onSubmit={form3.handleSubmit(onStep3Submit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form3.control}
                      name="yearsInIbiza"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Años en Ibiza</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form3.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamaño del Equipo</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Atrás
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createProfileMutation.isPending}
                    >
                      {createProfileMutation.isPending ? (
                        'Creando perfil...'
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Crear Perfil
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
