-- Create participants table
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    location JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create devotees table
CREATE TABLE IF NOT EXISTS public.devotees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    spiritual_name TEXT,
    years_on_path INTEGER,
    lesson_number INTEGER,
    profession TEXT,
    background TEXT,
    favorite_quote TEXT,
    favorite_chant TEXT,
    location JSONB NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    center_id UUID REFERENCES public.centers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create prayer requests table
CREATE TABLE IF NOT EXISTS public.prayer_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    requester_id UUID REFERENCES auth.users(id),
    requester_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create prayer responses table
CREATE TABLE IF NOT EXISTS public.prayer_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
    responder_id UUID REFERENCES auth.users(id),
    responder_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create prayer beacons table
CREATE TABLE IF NOT EXISTS public.prayer_beacons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location JSONB NOT NULL,
    participants INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create centers table
CREATE TABLE IF NOT EXISTS public.centers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    location JSONB NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create convocation moments table
CREATE TABLE IF NOT EXISTS public.convocation_moments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    location JSONB,
    center_id UUID REFERENCES public.centers(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create devotee analytics table
CREATE TABLE IF NOT EXISTS public.devotee_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    center_id UUID REFERENCES public.centers(id),
    region TEXT NOT NULL,
    total_devotees INTEGER DEFAULT 0,
    active_devotees INTEGER DEFAULT 0,
    new_devotees INTEGER DEFAULT 0,
    years_on_path_distribution JSONB,
    lesson_distribution JSONB,
    profession_distribution JSONB,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(center_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_participants_status ON public.participants(status);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON public.participants(created_at);
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants(email);
CREATE INDEX IF NOT EXISTS idx_devotees_location ON public.devotees USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_devotees_is_approved ON public.devotees(is_approved);
CREATE INDEX IF NOT EXISTS idx_devotees_is_visible ON public.devotees(is_visible);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON public.prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_requester ON public.prayer_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_prayer_responses_request ON public.prayer_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_prayer_beacons_location ON public.prayer_beacons USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_centers_location ON public.centers USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_centers_region ON public.centers(region);
CREATE INDEX IF NOT EXISTS idx_convocation_moments_center ON public.convocation_moments(center_id);
CREATE INDEX IF NOT EXISTS idx_convocation_moments_created_by ON public.convocation_moments(created_by);
CREATE INDEX IF NOT EXISTS idx_devotee_analytics_center ON public.devotee_analytics(center_id);
CREATE INDEX IF NOT EXISTS idx_devotee_analytics_region ON public.devotee_analytics(region);
CREATE INDEX IF NOT EXISTS idx_devotee_analytics_date ON public.devotee_analytics(date);
CREATE INDEX IF NOT EXISTS idx_devotees_center ON public.devotees(center_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convocation_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotee_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON public.participants
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.participants
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for own records" ON public.participants
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create policies for devotees
CREATE POLICY "Enable read access for all users" ON public.devotees
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Enable insert for authenticated users" ON public.devotees
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for own records" ON public.devotees
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Create policies for prayer requests
CREATE POLICY "Enable read access for authenticated users" ON public.prayer_requests
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.prayer_requests
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for own requests" ON public.prayer_requests
    FOR UPDATE TO authenticated USING (auth.uid() = requester_id);

-- Create policies for prayer responses
CREATE POLICY "Enable read access for authenticated users" ON public.prayer_responses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.prayer_responses
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for own responses" ON public.prayer_responses
    FOR UPDATE TO authenticated USING (auth.uid() = responder_id);

-- Create policies for prayer beacons
CREATE POLICY "Enable read access for all users" ON public.prayer_beacons
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.prayer_beacons
    FOR INSERT TO authenticated WITH CHECK (true);

-- Create policies for centers
CREATE POLICY "Enable read access for all users" ON public.centers
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.centers
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for admins" ON public.centers
    FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for convocation moments
CREATE POLICY "Enable read access for all users" ON public.convocation_moments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.convocation_moments
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for own moments" ON public.convocation_moments
    FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Create policies for devotee analytics
CREATE POLICY "Enable read access for all users" ON public.devotee_analytics
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for admins" ON public.devotee_analytics
    FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable update for admins" ON public.devotee_analytics
    FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update analytics
CREATE OR REPLACE FUNCTION public.update_devotee_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update analytics for the center
    INSERT INTO public.devotee_analytics (
        center_id,
        region,
        total_devotees,
        active_devotees,
        new_devotees,
        years_on_path_distribution,
        lesson_distribution,
        profession_distribution
    )
    SELECT
        NEW.center_id,
        c.region,
        COUNT(*) as total_devotees,
        COUNT(CASE WHEN d.is_approved = true THEN 1 END) as active_devotees,
        COUNT(CASE WHEN d.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_devotees,
        jsonb_object_agg(
            COALESCE(d.years_on_path::text, 'unknown'),
            COUNT(*)
        ) as years_on_path_distribution,
        jsonb_object_agg(
            COALESCE(d.lesson_number::text, 'unknown'),
            COUNT(*)
        ) as lesson_distribution,
        jsonb_object_agg(
            COALESCE(d.profession, 'unknown'),
            COUNT(*)
        ) as profession_distribution
    FROM public.devotees d
    JOIN public.centers c ON d.center_id = c.id
    WHERE d.center_id = NEW.center_id
    GROUP BY c.region
    ON CONFLICT (center_id, date) DO UPDATE
    SET
        total_devotees = EXCLUDED.total_devotees,
        active_devotees = EXCLUDED.active_devotees,
        new_devotees = EXCLUDED.new_devotees,
        years_on_path_distribution = EXCLUDED.years_on_path_distribution,
        lesson_distribution = EXCLUDED.lesson_distribution,
        profession_distribution = EXCLUDED.profession_distribution,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_devotees_updated_at
    BEFORE UPDATE ON public.devotees
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_prayer_requests_updated_at
    BEFORE UPDATE ON public.prayer_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_prayer_beacons_updated_at
    BEFORE UPDATE ON public.prayer_beacons
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_centers_updated_at
    BEFORE UPDATE ON public.centers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_convocation_moments_updated_at
    BEFORE UPDATE ON public.convocation_moments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_devotee_analytics_updated_at
    BEFORE UPDATE ON public.devotee_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for analytics updates
CREATE TRIGGER update_analytics_on_devotee_change
    AFTER INSERT OR UPDATE OR DELETE ON public.devotees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_devotee_analytics(); 