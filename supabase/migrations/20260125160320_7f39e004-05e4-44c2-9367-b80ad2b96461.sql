-- Create theaters table
CREATE TABLE public.theaters (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    facilities TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create showtimes table linking movies and theaters
CREATE TABLE public.showtimes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    theater_id UUID NOT NULL REFERENCES public.theaters(id) ON DELETE CASCADE,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    available_seats INTEGER NOT NULL DEFAULT 100,
    price NUMERIC NOT NULL DEFAULT 250.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(movie_id, theater_id, show_date, show_time)
);

-- Enable RLS
ALTER TABLE public.theaters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;

-- Public read access for theaters and showtimes
CREATE POLICY "Anyone can view theaters" ON public.theaters FOR SELECT USING (true);
CREATE POLICY "Anyone can view showtimes" ON public.showtimes FOR SELECT USING (true);

-- Add theater_id and showtime_id to bookings
ALTER TABLE public.bookings ADD COLUMN theater_id UUID REFERENCES public.theaters(id);
ALTER TABLE public.bookings ADD COLUMN showtime_id UUID REFERENCES public.showtimes(id);

-- Insert sample theaters
INSERT INTO public.theaters (name, location, address, facilities) VALUES
('PVR Cinemas', 'Phoenix Mall, Mumbai', '462 Senapati Bapat Marg, Lower Parel', ARRAY['Dolby Atmos', 'IMAX', 'Recliner Seats', 'Food Court']),
('INOX', 'R-City Mall, Mumbai', 'LBS Marg, Ghatkopar West', ARRAY['4K Projection', 'Premium Seating', 'Parking']),
('Cinepolis', 'Viviana Mall, Thane', 'Eastern Express Highway, Thane', ARRAY['MX4D', 'VIP Lounge', 'Kids Zone']),
('Carnival Cinemas', 'Andheri West', 'Oshiwara, Link Road, Andheri West', ARRAY['3D', 'Snack Bar', 'Wheelchair Access']);

-- Insert sample showtimes for existing movies (will be linked dynamically)
-- This creates showtimes for today and next 3 days