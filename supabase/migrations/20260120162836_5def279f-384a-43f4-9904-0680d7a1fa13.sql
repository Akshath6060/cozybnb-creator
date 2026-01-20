-- Create user roles enum and table for admin management
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update properties RLS to allow hosts to manage their own properties
CREATE POLICY "Hosts can manage property_images"
ON public.property_images
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = property_images.property_id
    AND properties.host_id = auth.uid()
  )
);

-- Add insert policy for property_images
CREATE POLICY "Users can insert property_images for their properties"
ON public.property_images
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = property_images.property_id
    AND properties.host_id = auth.uid()
  )
);