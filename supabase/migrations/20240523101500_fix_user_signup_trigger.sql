
-- Update the handle_new_user_signup function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  org_id UUID;
  org_name TEXT;
BEGIN
  -- Get organization name from user metadata or use a default
  org_name := COALESCE(NEW.raw_user_meta_data->>'organization_name', 'My Organization');
  
  -- Check if the user already has a profile (prevents duplicates)
  IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    -- Profile exists, ensure it has an organization
    IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id AND organization_id IS NULL) THEN
      -- Create new organization for existing profile without org
      INSERT INTO organizations (name)
      VALUES (org_name)
      RETURNING id INTO org_id;
      
      -- Update the existing profile with the new organization
      UPDATE profiles 
      SET 
        organization_id = org_id,
        is_superadmin = true,
        updated_at = now()
      WHERE id = NEW.id;
    END IF;
  ELSE
    -- Create new organization
    INSERT INTO organizations (name)
    VALUES (org_name)
    RETURNING id INTO org_id;

    -- Create profile with organization link
    INSERT INTO profiles (
      id,
      first_name,
      last_name,
      email,
      phone_number,
      organization_id,
      is_superadmin,
      status
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email,
      NEW.raw_user_meta_data->>'phone_number',
      org_id,
      true,
      'active'
    );
  END IF;

  -- Ensure user role exists
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = NEW.id) THEN
    -- Create super_admin role entry
    INSERT INTO user_roles (
      user_id,
      role
    ) VALUES (
      NEW.id,
      'super_admin'
    );
  END IF;

  RETURN NEW;
END;
$function$;
