
-- This script will fix the profile for mom@gmail.com if it exists
DO $$
DECLARE
  target_email TEXT := 'mom@gmail.com';
  user_id UUID;
  org_id UUID;
BEGIN
  -- Get the user ID for the target email
  SELECT id INTO user_id FROM auth.users WHERE email = target_email;
  
  IF user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found', target_email;
    RETURN;
  END IF;
  
  -- Check if profile exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- Check if profile already has an organization
    IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND organization_id IS NOT NULL) THEN
      RAISE NOTICE 'User already has an organization assigned';
      
      -- Get the user's organization ID
      SELECT organization_id INTO org_id FROM profiles WHERE id = user_id;
    ELSE
      -- Create a new organization
      INSERT INTO organizations (name)
      VALUES ('Mom''s Organization')
      RETURNING id INTO org_id;
      
      -- Update the existing profile
      UPDATE profiles
      SET 
        organization_id = org_id,
        is_superadmin = true,
        updated_at = now()
      WHERE id = user_id;
      
      RAISE NOTICE 'Updated profile with new organization ID %', org_id;
    END IF;
  ELSE
    -- Create a new organization
    INSERT INTO organizations (name)
    VALUES ('Mom''s Organization')
    RETURNING id INTO org_id;
    
    -- Create a new profile
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      organization_id,
      is_superadmin,
      status
    ) VALUES (
      user_id,
      target_email,
      'Mom',
      'User',
      org_id,
      true,
      'active'
    );
    
    RAISE NOTICE 'Created new profile with organization ID %', org_id;
  END IF;
  
  -- Ensure user role exists
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_id) THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (user_id, 'super_admin');
    
    RAISE NOTICE 'Created super_admin role for user';
  END IF;
  
  -- Fix any tenants without organization_id
  UPDATE tenants 
  SET organization_id = org_id
  WHERE organization_id IS NULL;
  
  -- Fix tenants belonging to wrong organizations
  UPDATE tenants
  SET organization_id = org_id
  WHERE id IN (
    SELECT t.id 
    FROM tenants t
    LEFT JOIN profiles p ON t.organization_id = p.organization_id
    WHERE p.id IS NULL
  );
  
  RAISE NOTICE 'Updated tenant organization records to match user organization';
END $$;
