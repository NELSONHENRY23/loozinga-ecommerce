
-- Loozinga customer profile provisioning
-- Run once in Supabase SQL Editor after reviewing.
-- Also keep this file in Git for new deployments.

BEGIN;

CREATE OR REPLACE FUNCTION public.create_customer_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(
        LEFT(
          TRIM(NEW.raw_user_meta_data ->> 'name'),
          150
        ),
        ''
      ),
      'Customer'
    ),
    'Customer'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.create_customer_profile()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS
  on_auth_user_created_loozinga
ON auth.users;

CREATE TRIGGER on_auth_user_created_loozinga
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_customer_profile();

COMMIT;
