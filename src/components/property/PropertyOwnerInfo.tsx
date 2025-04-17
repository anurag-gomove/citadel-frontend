
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PropertyOwner } from "@/types/database";

interface PropertyOwnerInfoProps {
  propertyId: string;
  isEditing: boolean;
}

export function PropertyOwnerInfo({ propertyId, isEditing }: PropertyOwnerInfoProps) {
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(isEditing);

  // Fetch property owners
  useEffect(() => {
    const fetchPropertyOwners = async () => {
      try {
        const { data, error } = await supabase
          .from('property_owners')
          .select('*')
          .eq('property_id', propertyId)
          .order('is_primary', { ascending: false });

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setOwners(data as PropertyOwner[]);
        } else {
          // Initialize with one empty owner when none exist
          setOwners([{
            property_id: propertyId,
            full_name: '',
            is_primary: true,
            street_number: '',
            street_name: '',
            apartment: '',
            city: '',
            zipcode: '',
            phone: '',
            other_phone: '',
            email: ''
          }]);
        }
      } catch (error) {
        console.error('Error fetching property owners:', error);
        toast.error('Failed to load property owners');
        // Initialize with one empty owner when there's an error
        setOwners([{
          property_id: propertyId,
          full_name: '',
          is_primary: true,
          street_number: '',
          street_name: '',
          apartment: '',
          city: '',
          zipcode: '',
          phone: '',
          other_phone: '',
          email: ''
        }]);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchPropertyOwners();
    }
  }, [propertyId]);

  // Add new owner
  const handleAddOwner = () => {
    if (owners.length >= 2) {
      toast.error('Maximum of two owners allowed');
      return;
    }
    
    const newOwner: PropertyOwner = {
      property_id: propertyId,
      full_name: '',
      is_primary: false,
      street_number: '',
      street_name: '',
      apartment: '',
      city: '',
      zipcode: '',
      phone: '',
      other_phone: '',
      email: ''
    };
    setOwners([...owners, newOwner]);
  };

  // Remove owner
  const handleRemoveOwner = async (index: number) => {
    const ownerToRemove = owners[index];

    // If owner has an ID, it exists in DB and needs to be deleted
    if (ownerToRemove.id) {
      try {
        const { error } = await supabase
          .from('property_owners')
          .delete()
          .eq('id', ownerToRemove.id);

        if (error) {
          throw error;
        }

        toast.success('Owner removed successfully');
      } catch (error) {
        console.error('Error removing property owner:', error);
        toast.error('Failed to remove property owner');
        return; // Don't proceed with UI update if DB update failed
      }
    }

    // Update state
    const updatedOwners = [...owners];
    updatedOwners.splice(index, 1);
    
    // If primary owner is removed and we have other owners, set first one as primary
    if (ownerToRemove.is_primary && updatedOwners.length > 0) {
      updatedOwners[0].is_primary = true;
      
      // Update in DB if the owner exists
      if (updatedOwners[0].id) {
        try {
          await supabase
            .from('property_owners')
            .update({ is_primary: true })
            .eq('id', updatedOwners[0].id);
        } catch (error) {
          console.error('Error updating primary owner:', error);
        }
      }
    }
    
    setOwners(updatedOwners);
  };

  // Handle field changes
  const handleOwnerChange = (index: number, field: keyof PropertyOwner, value: string | boolean) => {
    const updatedOwners = [...owners];
    updatedOwners[index] = {
      ...updatedOwners[index],
      [field]: value,
    };
    setOwners(updatedOwners);
  };

  // Set primary owner
  const handleSetPrimary = async (index: number) => {
    const updatedOwners = owners.map((owner, i) => ({
      ...owner,
      is_primary: i === index,
    }));
    
    setOwners(updatedOwners);
  };

  // Save all owners
  const saveOwners = async () => {
    for (const owner of owners) {
      try {
        if (owner.id) {
          // Update existing owner
          const { error } = await supabase
            .from('property_owners')
            .update({
              full_name: owner.full_name,
              street_number: owner.street_number,
              street_name: owner.street_name,
              apartment: owner.apartment,
              city: owner.city,
              zipcode: owner.zipcode,
              phone: owner.phone,
              other_phone: owner.other_phone,
              email: owner.email,
              is_primary: owner.is_primary,
              updated_at: new Date().toISOString() // Fix: convert Date to string
            })
            .eq('id', owner.id);

          if (error) throw error;
        } else {
          // Insert new owner
          const { error } = await supabase
            .from('property_owners')
            .insert({
              property_id: propertyId,
              full_name: owner.full_name,
              street_number: owner.street_number,
              street_name: owner.street_name,
              apartment: owner.apartment,
              city: owner.city,
              zipcode: owner.zipcode,
              phone: owner.phone,
              other_phone: owner.other_phone,
              email: owner.email,
              is_primary: owner.is_primary
            });

          if (error) throw error;
        }
      } catch (error) {
        console.error('Error saving property owner:', error);
        toast.error('Failed to save property owner information');
        return false;
      }
    }
    
    toast.success('Property owners saved successfully');
    return true;
  };

  // Toggle editing mode
  const toggleEditing = async () => {
    if (editing) {
      // Save changes before exiting edit mode
      const success = await saveOwners();
      if (success) {
        setEditing(false);
      }
    } else {
      setEditing(true);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading owner information...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Property Owner Information</h3>
        <Button
          type="button"
          variant={editing ? "default" : "outline"}
          onClick={toggleEditing}
        >
          {editing ? "Save" : "Edit"}
        </Button>
      </div>

      {owners.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No owner information available.
          <div className="mt-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleAddOwner}
            >
              Add Owner Information
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {owners.map((owner, index) => (
            <div key={index} className="border p-4 rounded-md space-y-4 bg-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <h4 className="font-medium">{owner.is_primary ? 'Primary Owner' : `Owner ${index + 1}`}</h4>
                  {!owner.is_primary && editing && (
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => handleSetPrimary(index)}
                      className="p-0 h-auto ml-2 text-sm text-blue-500"
                    >
                      Set as Primary
                    </Button>
                  )}
                </div>
                {editing && owners.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOwner(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`owner-name-${index}`}>Full Name</Label>
                  <Input
                    id={`owner-name-${index}`}
                    value={owner.full_name}
                    onChange={(e) => handleOwnerChange(index, 'full_name', e.target.value)}
                    disabled={!editing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`owner-email-${index}`}>Email</Label>
                  <Input
                    id={`owner-email-${index}`}
                    type="email"
                    value={owner.email || ''}
                    onChange={(e) => handleOwnerChange(index, 'email', e.target.value)}
                    disabled={!editing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`owner-phone-${index}`}>Phone</Label>
                  <Input
                    id={`owner-phone-${index}`}
                    value={owner.phone || ''}
                    onChange={(e) => handleOwnerChange(index, 'phone', e.target.value)}
                    disabled={!editing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`owner-other-phone-${index}`}>Other Phone</Label>
                  <Input
                    id={`owner-other-phone-${index}`}
                    value={owner.other_phone || ''}
                    onChange={(e) => handleOwnerChange(index, 'other_phone', e.target.value)}
                    disabled={!editing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`owner-street-number-${index}`}>Street Number</Label>
                  <Input
                    id={`owner-street-number-${index}`}
                    value={owner.street_number || ''}
                    onChange={(e) => handleOwnerChange(index, 'street_number', e.target.value)}
                    disabled={!editing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`owner-street-name-${index}`}>Street Name</Label>
                  <Input
                    id={`owner-street-name-${index}`}
                    value={owner.street_name || ''}
                    onChange={(e) => handleOwnerChange(index, 'street_name', e.target.value)}
                    disabled={!editing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`owner-apartment-${index}`}>Apartment</Label>
                  <Input
                    id={`owner-apartment-${index}`}
                    value={owner.apartment || ''}
                    onChange={(e) => handleOwnerChange(index, 'apartment', e.target.value)}
                    disabled={!editing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`owner-city-${index}`}>City</Label>
                  <Input
                    id={`owner-city-${index}`}
                    value={owner.city || ''}
                    onChange={(e) => handleOwnerChange(index, 'city', e.target.value)}
                    disabled={!editing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`owner-zipcode-${index}`}>Zipcode</Label>
                  <Input
                    id={`owner-zipcode-${index}`}
                    value={owner.zipcode || ''}
                    onChange={(e) => handleOwnerChange(index, 'zipcode', e.target.value)}
                    disabled={!editing}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {editing && owners.length < 2 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOwner}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Second Owner
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
