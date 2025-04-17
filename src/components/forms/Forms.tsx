
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UploadFormDialog } from "./UploadFormDialog";
import { FormPreviewDialog } from "./FormPreviewDialog";
import { FormCard } from "./FormCard";
import { Form, FormStatus } from "@/types/form";

export function Forms() {
  const { toast } = useToast();
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const { data: forms = [], isLoading, error } = useQuery({
    queryKey: ["forms"],
    queryFn: async () => {
      const { data: formsData, error } = await supabase
        .from("forms")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching forms:", error);
        throw error;
      }

      const formsWithDefaults: Form[] = formsData?.map(form => ({
        ...form,
        status: 'pending' as FormStatus,
        html_path: null,
        icon: 'file',
        isFavorite: false
      })) || [];

      console.log("Fetched forms:", formsWithDefaults);
      return formsWithDefaults;
    },
    refetchInterval: (currentData) => {
      if (!Array.isArray(currentData)) return false;
      const hasProcessingForms = currentData.some(
        (form: Form) => form.status === 'processing'
      );
      return hasProcessingForms ? 5000 : false;
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Available Forms</CardTitle>
          <CardDescription>
            Browse and manage your forms. Forms are automatically converted to HTML for better viewing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                viewMode={viewMode}
                onView={() => setSelectedForm(form)}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload New Form
          </Button>
        </CardFooter>
      </Card>

      <UploadFormDialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={() => {
          setIsUploadDialogOpen(false);
        }}
      />

      <FormPreviewDialog
        form={selectedForm}
        onClose={() => setSelectedForm(null)}
      />
    </div>
  );
}
