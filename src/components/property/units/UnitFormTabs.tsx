
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, DollarSign, Home, Package, Sofa } from "lucide-react";

interface UnitFormTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  basicInfoContent: React.ReactNode;
  rentalContent: React.ReactNode;
  parkingStorageContent: React.ReactNode; 
  furnitureAppliancesContent: React.ReactNode;
  otherInfoContent: React.ReactNode;
}

export function UnitFormTabs({
  activeTab,
  setActiveTab,
  basicInfoContent,
  rentalContent,
  parkingStorageContent,
  furnitureAppliancesContent,
  otherInfoContent,
}: UnitFormTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full">
        <TabsTrigger value="basic-info" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Basic Info</span>
        </TabsTrigger>

        <TabsTrigger value="parking-storage" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span className="hidden sm:inline">Parking & Storage</span>
        </TabsTrigger>

        <TabsTrigger value="furniture-appliances" className="flex items-center gap-2">
          <Sofa className="h-4 w-4" />
          <span className="hidden sm:inline">Furniture & Appliances</span>
        </TabsTrigger>

        <TabsTrigger value="rental" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Rental</span>
        </TabsTrigger>

        <TabsTrigger value="other-info" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Other Info</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-4">
        <TabsContent value="basic-info">{basicInfoContent}</TabsContent>
        <TabsContent value="parking-storage">{parkingStorageContent}</TabsContent>
        <TabsContent value="furniture-appliances">{furnitureAppliancesContent}</TabsContent>
        <TabsContent value="rental">{rentalContent}</TabsContent>
        <TabsContent value="other-info">{otherInfoContent}</TabsContent>
      </div>
    </Tabs>
  );
}
