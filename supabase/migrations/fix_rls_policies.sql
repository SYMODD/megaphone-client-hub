-- Fix RLS policies to avoid recursion issues
-- The current policies create infinite loops when checking admin permissions

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Supervisors can view relevant profiles" ON public.profiles;

-- Create new policies without recursion

-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 2. Users can update their own profile  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Admin users can view all profiles (using email-based check to avoid recursion)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'essbane.salim@gmail.com' OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 4. Admin users can insert profiles (for user creation)
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = 'essbane.salim@gmail.com' OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 5. Admin users can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR -- Users can update own profile
    auth.jwt() ->> 'email' = 'essbane.salim@gmail.com' OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 6. Admin users can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (
    auth.jwt() ->> 'email' = 'essbane.salim@gmail.com' OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 7. Supervisors can view relevant profiles (simplified)
CREATE POLICY "Supervisors can view relevant profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users supervisor_user
      WHERE supervisor_user.id = auth.uid() 
      AND supervisor_user.raw_user_meta_data->>'role' = 'superviseur'
    )
  ); 