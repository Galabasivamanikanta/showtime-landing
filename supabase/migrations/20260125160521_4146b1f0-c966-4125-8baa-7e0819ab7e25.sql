-- Create booked_seats table to track individual seat bookings
CREATE TABLE public.booked_seats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    showtime_id UUID NOT NULL REFERENCES public.showtimes(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    seat_row TEXT NOT NULL,
    seat_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(showtime_id, seat_row, seat_number)
);

-- Enable RLS
ALTER TABLE public.booked_seats ENABLE ROW LEVEL SECURITY;

-- Anyone can view booked seats (to show availability)
CREATE POLICY "Anyone can view booked seats" ON public.booked_seats FOR SELECT USING (true);

-- Authenticated users can book seats
CREATE POLICY "Authenticated users can book seats" ON public.booked_seats FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add selected_seats column to bookings table
ALTER TABLE public.bookings ADD COLUMN selected_seats TEXT[] DEFAULT '{}';