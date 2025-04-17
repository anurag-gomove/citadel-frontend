
-- Update the tenants query to filter by organization_id
-- This ensures data isolation between organizations

-- First, ensure the organization_id column is not null for existing tenants
UPDATE tenants
SET organization_id = (
  SELECT organization_id 
  FROM profiles 
  WHERE profiles.id = auth.uid()
)
WHERE organization_id IS NULL;

-- Then add a not null constraint for future tenants
ALTER TABLE tenants
ALTER COLUMN organization_id SET NOT NULL;

-- Enable row-level security if not already enabled
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Update or recreate the RLS policies to ensure proper organization filtering
DROP POLICY IF EXISTS "Users can only view tenants from their organization" ON tenants;
CREATE POLICY "Users can only view tenants from their organization" 
ON tenants FOR SELECT 
USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can only create tenants for their organization" ON tenants;
CREATE POLICY "Users can only create tenants for their organization" 
ON tenants FOR INSERT 
WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can only update tenants from their organization" ON tenants;
CREATE POLICY "Users can only update tenants from their organization" 
ON tenants FOR UPDATE 
USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can only delete tenants from their organization" ON tenants;
CREATE POLICY "Users can only delete tenants from their organization" 
ON tenants FOR DELETE 
USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
