-- Creates a public profile automatically for each Supabase Auth user.
-- Execute after supabase/schema.sql for existing projects.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, document)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'document', '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for accounts that existed before this trigger.
INSERT INTO public.profiles (user_id, full_name, phone, document)
SELECT
  users.id,
  COALESCE(users.raw_user_meta_data ->> 'full_name', ''),
  COALESCE(users.raw_user_meta_data ->> 'phone', ''),
  COALESCE(users.raw_user_meta_data ->> 'document', '')
FROM auth.users AS users
ON CONFLICT (user_id) DO NOTHING;

-- Promote administrators manually in the Supabase SQL editor; never from the UI.
-- UPDATE public.profiles SET role = 'admin' WHERE user_id = '<AUTH_USER_UUID>';
