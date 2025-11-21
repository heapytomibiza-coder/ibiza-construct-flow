
-- Enable RLS on category_suggestions if not already enabled
ALTER TABLE public.category_suggestions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to recreate them
DROP POLICY IF EXISTS "Users can view their own suggestions" ON public.category_suggestions;
DROP POLICY IF EXISTS "Users can create suggestions" ON public.category_suggestions;
DROP POLICY IF EXISTS "Admins can view all suggestions" ON public.category_suggestions;
DROP POLICY IF EXISTS "Admins can update suggestions" ON public.category_suggestions;

-- Allow users to view their own suggestions
CREATE POLICY "Users can view their own suggestions"
ON public.category_suggestions
FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to create suggestions
CREATE POLICY "Users can create suggestions"
ON public.category_suggestions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all suggestions
CREATE POLICY "Admins can view all suggestions"
ON public.category_suggestions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update suggestions (for review)
CREATE POLICY "Admins can update suggestions"
ON public.category_suggestions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
