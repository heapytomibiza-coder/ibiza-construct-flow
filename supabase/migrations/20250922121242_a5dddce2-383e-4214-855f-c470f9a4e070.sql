-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'professional');
CREATE TYPE public.booking_status AS ENUM ('draft', 'posted', 'matched', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.milestone_status AS ENUM ('pending', 'completed', 'disputed');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'refunded', 'disputed');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    display_name TEXT,
    preferred_language TEXT DEFAULT 'en',
    roles JSONB DEFAULT '["client"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create professional_profiles table
CREATE TABLE public.professional_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    primary_trade TEXT,
    zones JSONB DEFAULT '[]'::jsonb,
    languages JSONB DEFAULT '["en"]'::jsonb,
    verification_status TEXT DEFAULT 'unverified',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    micro TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(category, subcategory, micro)
);

-- Create service_questions table
CREATE TABLE public.service_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    questions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id),
    title TEXT NOT NULL,
    description TEXT,
    status booking_status DEFAULT 'draft',
    micro_q_answers JSONB DEFAULT '{}'::jsonb,
    general_answers JSONB DEFAULT '{}'::jsonb,
    budget_range TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create job_matches table
CREATE TABLE public.job_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create professional_applications table
CREATE TABLE public.professional_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT,
    proposed_price DECIMAL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create milestones table
CREATE TABLE public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL,
    status milestone_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create escrow_payments table
CREATE TABLE public.escrow_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.milestones(id),
    amount DECIMAL NOT NULL,
    status payment_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create feature_flags table
CREATE TABLE public.feature_flags (
    key TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for professional_profiles
CREATE POLICY "Users can view their own professional profile" ON public.professional_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own professional profile" ON public.professional_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own professional profile" ON public.professional_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for services (public read)
CREATE POLICY "Services are publicly readable" ON public.services FOR SELECT USING (true);

-- RLS Policies for service_questions (public read)
CREATE POLICY "Service questions are publicly readable" ON public.service_questions FOR SELECT USING (true);

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can insert their own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = client_id);

-- RLS Policies for job_matches
CREATE POLICY "Users can view matches for their bookings or applications" ON public.job_matches FOR SELECT USING (
    auth.uid() IN (
        SELECT client_id FROM public.bookings WHERE id = booking_id
        UNION
        SELECT professional_id
    )
);

-- RLS Policies for professional_applications
CREATE POLICY "Users can view applications for their bookings or their own applications" ON public.professional_applications FOR SELECT USING (
    auth.uid() = professional_id OR 
    auth.uid() IN (SELECT client_id FROM public.bookings WHERE id = booking_id)
);
CREATE POLICY "Professionals can insert applications" ON public.professional_applications FOR INSERT WITH CHECK (auth.uid() = professional_id);

-- RLS Policies for milestones
CREATE POLICY "Users can view milestones for their bookings" ON public.milestones FOR SELECT USING (
    auth.uid() IN (SELECT client_id FROM public.bookings WHERE id = booking_id)
);

-- RLS Policies for escrow_payments
CREATE POLICY "Users can view payments for their bookings" ON public.escrow_payments FOR SELECT USING (
    auth.uid() IN (SELECT client_id FROM public.bookings WHERE id = booking_id)
);

-- RLS Policies for feature_flags (public read)
CREATE POLICY "Feature flags are publicly readable" ON public.feature_flags FOR SELECT USING (true);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, roles)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(
            CASE 
                WHEN NEW.raw_user_meta_data->>'intent_role' = 'professional' THEN '["professional"]'::jsonb
                WHEN NEW.raw_user_meta_data->>'intent_role' = 'client' THEN '["client"]'::jsonb
                ELSE '["client"]'::jsonb
            END
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_professional_profiles_updated_at BEFORE UPDATE ON public.professional_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial feature flags
INSERT INTO public.feature_flags (key, enabled, description) VALUES
    ('ff.magicLink', true, 'Enable magic link authentication'),
    ('ff.socialAuth', true, 'Enable social authentication (Apple/Google)'),
    ('ff.jobWizardV2', false, 'Client job posting wizard v2'),
    ('ff.proInboxV1', false, 'Pro opportunities inbox'),
    ('ff.adminCurationV1', false, 'Admin curation queue'),
    ('ff.messaging', false, 'Messaging hub'),
    ('ff.escrow', false, 'Escrow payments'),
    ('ff.roleFirst', true, 'Role-first authentication flow'),
    ('ff.quickStart', true, 'Quick start onboarding flows')
ON CONFLICT (key) DO NOTHING;

-- Seed handyman services
INSERT INTO public.services (category, subcategory, micro) VALUES
    ('Home & Property Services', 'Handyman', 'TV Mounting'),
    ('Home & Property Services', 'Handyman', 'Furniture Assembly'),
    ('Home & Property Services', 'Handyman', 'Shelf Installation'),
    ('Home & Property Services', 'Handyman', 'Curtain/Blind Fitting'),
    ('Home & Property Services', 'Handyman', 'Door Repair'),
    ('Home & Property Services', 'Handyman', 'Picture/Mirror Hanging'),
    ('Home & Property Services', 'Handyman', 'Light Fixture Installation'),
    ('Home & Property Services', 'Handyman', 'Bathroom Fittings'),
    ('Home & Property Services', 'Handyman', 'Kitchen Installation'),
    ('Home & Property Services', 'Handyman', 'Tile Repair'),
    ('Home & Property Services', 'Handyman', 'Paint Touch-ups'),
    ('Home & Property Services', 'Handyman', 'Window Repair'),
    ('Home & Property Services', 'Handyman', 'Fence Installation'),
    ('Home & Property Services', 'Handyman', 'Deck Repair'),
    ('Home & Property Services', 'Handyman', 'Gutter Cleaning'),
    ('Home & Property Services', 'Handyman', 'Drywall Repair'),
    ('Home & Property Services', 'Handyman', 'Weatherproofing'),
    ('Home & Property Services', 'Handyman', 'Power Washing'),
    ('Home & Property Services', 'Handyman', 'Appliance Installation'),
    ('Home & Property Services', 'Handyman', 'Security System Setup'),
    ('Home & Property Services', 'Handyman', 'Smart Home Installation'),
    ('Home & Property Services', 'Handyman', 'Cable Management'),
    ('Home & Property Services', 'Handyman', 'Minor Electrical Work'),
    ('Home & Property Services', 'Handyman', 'Minor Plumbing Work')
ON CONFLICT DO NOTHING;

-- Insert sample service questions
WITH tv_mounting AS (
    SELECT id FROM public.services 
    WHERE category = 'Home & Property Services' 
    AND subcategory = 'Handyman' 
    AND micro = 'TV Mounting'
)
INSERT INTO public.service_questions (service_id, version, questions)
SELECT tv_mounting.id, 1, '[
    {"key":"tv_size","type":"radio","label":"TV size?","options":["<32\"","32–50\"","51–65\"",">65\""],"required":true},
    {"key":"wall_type","type":"radio","label":"Wall type?","options":["Plasterboard","Brick/Concrete","Unsure"],"required":true},
    {"key":"bracket","type":"radio","label":"Do you have a bracket?","options":["Yes","No"],"required":true},
    {"key":"cable_conceal","type":"radio","label":"Cable concealment?","options":["No","Trunking","In-wall"],"required":false}
]'::jsonb
FROM tv_mounting;