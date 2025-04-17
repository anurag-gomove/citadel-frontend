
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, File } from "lucide-react";

const categories = [
  "Lease Agreements",
  "Maintenance Forms",
  "Legal Documents",
  "Application Forms",
];

interface UploadFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadFormDialog({ open, onClose, onSuccess }: UploadFormDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const isValidType = fileExt === 'pdf';
    
    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF document",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "No category selected",
        description: "Please select a category for the form",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No authenticated session");
      }

      // Prepare form data for the edge function
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', category);
      formData.append('userId', session.user.id);

      // Call the edge function to process the upload
      const { data, error } = await supabase.functions.invoke('convert-and-upload-form', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Form uploaded successfully",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error uploading form:', error);
      toast({
        title: "Error",
        description: "Failed to upload the form",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setCategory("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Form</DialogTitle>
          <DialogDescription>
            Upload a PDF document to add to your forms library
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? "border-primary bg-primary/10" : "border-muted"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <File className="h-6 w-6" />
                <span>{selectedFile.name}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your PDF file here, or{" "}
                    <label className="text-primary cursor-pointer hover:underline">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </p>
                </div>
              </div>
            )}
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
