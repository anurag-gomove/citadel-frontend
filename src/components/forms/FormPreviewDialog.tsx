
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Send, FileIcon, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface FormPreviewDialogProps {
  form: {
    id: string;
    name: string;
    category: string;
    description: string;
    icon: string;
    isFavorite: boolean;
    file_path?: string;
    html_path?: string;
    status?: 'pending' | 'processing' | 'ready' | 'error';
  } | null;
  onClose: () => void;
}

export function FormPreviewDialog({ form, onClose }: FormPreviewDialogProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchHtmlContent = async () => {
      if (form?.html_path && form.status === 'ready') {
        try {
          const { data } = await supabase.storage
            .from('forms')
            .download(form.html_path);
          
          if (data) {
            const text = await data.text();
            setHtmlContent(text);
          }
        } catch (error) {
          console.error('Error fetching HTML content:', error);
        }
      }
    };

    fetchHtmlContent();
  }, [form?.html_path, form?.status]);

  if (!form) return null;

  const fileUrl = form.file_path 
    ? supabase.storage.from('forms').getPublicUrl(form.file_path).data.publicUrl 
    : null;

  const getStatusDisplay = () => {
    switch (form.status) {
      case 'processing':
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <Badge variant="warning">Converting...</Badge>
          </div>
        );
      case 'ready':
        return <Badge variant="success">HTML Ready</Badge>;
      case 'error':
        return <Badge variant="destructive">Conversion Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const renderContent = () => {
    if (form.status === 'processing') {
      return (
        <div className="h-[600px] flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Converting your PDF to HTML...</div>
        </div>
      );
    }

    if (form.status === 'error') {
      return (
        <div className="h-[600px] flex flex-col items-center justify-center gap-4">
          <FileIcon className="h-12 w-12 text-destructive/50" />
          <div className="text-muted-foreground">Failed to convert the form</div>
        </div>
      );
    }

    if (htmlContent) {
      return (
        <iframe 
          className="w-full h-[600px] bg-white"
          srcDoc={htmlContent}
          title="Form Preview"
        />
      );
    }

    return (
      <div className="h-[600px] flex flex-col items-center justify-center gap-4">
        <Eye className="h-12 w-12 text-muted-foreground/50" />
        <div className="text-muted-foreground">No preview available yet</div>
      </div>
    );
  };

  return (
    <Dialog open={!!form} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-semibold">{form.name}</DialogTitle>
              <DialogDescription className="text-base flex items-center gap-2">
                <span className="font-medium text-foreground">{form.category}</span>
                <span className="mx-2">•</span>
                {getStatusDisplay()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-gradient-to-b from-muted/50 to-muted p-6 rounded-lg">
          <div className="bg-background rounded-md shadow-sm min-h-[600px] transition-all">
            {renderContent()}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {fileUrl && (
            <Button variant="outline" asChild>
              <a href={fileUrl} download={form.name}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            </Button>
          )}
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send Form
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
