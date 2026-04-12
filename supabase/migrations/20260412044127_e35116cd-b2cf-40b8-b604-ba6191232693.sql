
ALTER TABLE public.movies
ADD COLUMN trailer_url TEXT,
ADD COLUMN cast_members TEXT[],
ADD COLUMN director TEXT,
ADD COLUMN language TEXT DEFAULT 'English',
ADD COLUMN certificate TEXT;
