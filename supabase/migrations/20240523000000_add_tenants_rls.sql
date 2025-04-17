
-- Create RLS policy for tenants table to filter by organization
CREATE POLICY "Users can only view tenants from their organization" ON public.tenants
FOR SELECT USING (
  property_id IN (
    SELECT id FROM properties
    WHERE organization_id = (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
    )
  )
);

-- Also enable RLS on the tenants table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
