
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lease } from "@/types/lease";
import { Tenant } from "@/types/database";
import { SectionALandlordTenant } from "@/components/lease/SectionALandlordTenant";
import { SectionBDwellingDescription } from "@/components/lease/SectionBDwellingDescription";
import { SectionCLeaseTerm } from "@/components/lease/SectionCLeaseTerm";
import { SectionDRent } from "@/components/lease/SectionDRent";
import { SectionEServicesConditions } from "@/components/lease/SectionEServicesConditions";
import { SectionFRentRestrictions } from "@/components/lease/SectionFRentRestrictions";
import { SectionGNewTenantNotice } from "@/components/lease/SectionGNewTenantNotice";
import { SectionHSignatures } from "@/components/lease/SectionHSignatures";
import { SectionIFamilyResidence } from "@/components/lease/SectionIFamilyResidence";

interface LeaseTabsNavigationProps {
  activeTab: string;
  formData: Partial<Lease>;
  tenant: Tenant;
  selectedPropertyId: string | null;
  onTabChange: (value: string) => void;
  onFormChange: (section: string, data: any) => void;
}

export function LeaseTabsNavigation({
  activeTab,
  formData,
  tenant,
  selectedPropertyId,
  onTabChange,
  onFormChange
}: LeaseTabsNavigationProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-3 md:grid-cols-9 mb-4 bg-background border-b w-full rounded-none p-0 h-auto">
        <TabsTrigger 
          value="sectionA" 
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
        >
          A
        </TabsTrigger>
        <TabsTrigger 
          value="sectionB" 
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
        >
          B
        </TabsTrigger>
        <TabsTrigger 
          value="sectionC" 
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
        >
          C
        </TabsTrigger>
        <TabsTrigger 
          value="sectionD" 
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
        >
          D
        </TabsTrigger>
        <TabsTrigger 
          value="sectionE" 
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
        >
          E
        </TabsTrigger>
        <TabsTrigger 
          value="sectionF" 
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
        >
          F
        </TabsTrigger>
        <TabsTrigger 
          value="sectionG" 
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
        >
          G
        </TabsTrigger>
        <TabsTrigger 
          value="sectionH" 
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
        >
          H
        </TabsTrigger>
        <TabsTrigger 
          value="sectionI" 
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
        >
          I
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="sectionA" className="mt-0">
        <SectionALandlordTenant 
          formData={formData} 
          tenant={tenant}
          propertyId={selectedPropertyId}
          onChange={(data) => onFormChange("sectionA", data)} 
        />
        <div className="mt-6 flex justify-end">
          <Button onClick={() => onTabChange("sectionB")}>
            Next: Section B
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="sectionB" className="mt-0">
        <SectionBDwellingDescription 
          formData={formData} 
          onChange={(data) => onFormChange("sectionB", data)} 
        />
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => onTabChange("sectionA")}>
            Previous: Section A
          </Button>
          <Button onClick={() => onTabChange("sectionC")}>
            Next: Section C
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="sectionC" className="mt-0">
        <SectionCLeaseTerm 
          formData={formData} 
          onChange={(data) => onFormChange("sectionC", data)} 
        />
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => onTabChange("sectionB")}>
            Previous: Section B
          </Button>
          <Button onClick={() => onTabChange("sectionD")}>
            Next: Section D
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="sectionD" className="mt-0">
        <SectionDRent 
          formData={formData} 
          onChange={(data) => onFormChange("sectionD", data)} 
        />
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => onTabChange("sectionC")}>
            Previous: Section C
          </Button>
          <Button onClick={() => onTabChange("sectionE")}>
            Next: Section E
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="sectionE" className="mt-0">
        <SectionEServicesConditions 
          formData={formData} 
          onChange={(data) => onFormChange("sectionE", data)} 
        />
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => onTabChange("sectionD")}>
            Previous: Section D
          </Button>
          <Button onClick={() => onTabChange("sectionF")}>
            Next: Section F
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="sectionF" className="mt-0">
        <SectionFRentRestrictions 
          formData={formData} 
          onChange={(data) => onFormChange("sectionF", data)} 
        />
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => onTabChange("sectionE")}>
            Previous: Section E
          </Button>
          <Button onClick={() => onTabChange("sectionG")}>
            Next: Section G
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="sectionG" className="mt-0">
        <SectionGNewTenantNotice 
          formData={formData} 
          onChange={(data) => onFormChange("sectionG", data)} 
        />
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => onTabChange("sectionF")}>
            Previous: Section F
          </Button>
          <Button onClick={() => onTabChange("sectionH")}>
            Next: Section H
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="sectionH" className="mt-0">
        <SectionHSignatures 
          formData={formData} 
          tenant={tenant}
          onChange={(data) => onFormChange("sectionH", data)} 
        />
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => onTabChange("sectionG")}>
            Previous: Section G
          </Button>
          <Button onClick={() => onTabChange("sectionI")}>
            Next: Section I
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="sectionI" className="mt-0">
        <SectionIFamilyResidence 
          formData={formData} 
          onChange={(data) => onFormChange("sectionI", data)} 
        />
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => onTabChange("sectionH")}>
            Previous: Section H
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
