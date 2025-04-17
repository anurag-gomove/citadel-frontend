
import { useState } from "react";
import { Download, Eye, Send, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SendFormDialog } from "./SendFormDialog";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FormCardActionsProps {
  form: {
    id: string;
    name: string;
    file_path?: string;
  };
  onView: () => void;
  viewMode: "grid" | "list";
}

export function FormCardActions({ form, onView, viewMode }: FormCardActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDownload = async () => {
    if (!form.file_path) {
      toast({
        title: "Error",
        description: "No file available for download",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data } = supabase.storage
        .from('forms')
        .getPublicUrl(form.file_path);

      const link = document.createElement('a');
      link.href = data.publicUrl;
      link.download = `${form.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download the file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      // First delete any associated form fields
      const { error: fieldsError } = await supabase
        .from('form_fields')
        .delete()
        .eq('form_id', form.id);

      if (fieldsError) {
        console.error('Error deleting form fields:', fieldsError);
        throw fieldsError;
      }

      // Then delete the form record
      const { error: formError } = await supabase
        .from('forms')
        .delete()
        .eq('id', form.id);

      if (formError) throw formError;

      // If there's an associated file, delete it from storage
      if (form.file_path) {
        const { error: storageError } = await supabase.storage
          .from('forms')
          .remove([form.file_path]);

        if (storageError) {
          console.error('Error deleting file:', storageError);
          // Don't throw here as the form is already deleted
          toast({
            title: "Warning",
            description: "Form deleted but failed to remove associated file",
            variant: "destructive",
          });
          return;
        }
      }

      // Invalidate the forms query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["forms"] });

      toast({
        title: "Success",
        description: "Form deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Error",
        description: "Failed to delete the form",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEdit = () => {
    navigate(`/forms/builder/${form.id}`);
  };

  return (
    <div className={viewMode === "list" ? "flex items-center gap-2" : "flex gap-2"}>
      <Button size="sm" variant="outline" onClick={onView}>
        <Eye className="h-4 w-4 mr-2" />
        View
      </Button>
      <Button size="sm" variant="outline" onClick={handleEdit}>
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
      <Button size="sm" variant="outline" onClick={handleDownload}>
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
      <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
        <Send className="h-4 w-4 mr-2" />
        Send
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setIsDeleteDialogOpen(true)}
        className="text-red-500 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>

      <SendFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        formId={form.id}
        formName={form.name}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form
              "{form.name}" and remove any associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
