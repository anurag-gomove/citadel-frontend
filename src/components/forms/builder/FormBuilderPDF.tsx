
import React, { useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FieldData {
  id: string;
  pageNumber: number;
  type: string;
  label: string;
  x: number;
  y: number;
}

interface PageBounding {
  width: number;
  height: number;
  top: number;
  left: number;
}

const TOOLBAR_ITEMS = [
  { type: "text", label: "Text Field" },
  { type: "date", label: "Date Field" },
  { type: "signature", label: "Signature Field" },
];

interface FormBuilderPDFProps {
  pdfUrl: string | null;
  onFieldsChange?: (fields: FieldData[]) => void;
}

export function FormBuilderPDF({ pdfUrl, onFieldsChange }: FormBuilderPDFProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [pageBounds, setPageBounds] = useState<Map<number, PageBounding>>(new Map());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [activeField, setActiveField] = useState<FieldData | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const mouseSensor = useSensor(MouseSensor);
  const sensors = useSensors(mouseSensor);

  useEffect(() => {
    if (onFieldsChange) {
      onFieldsChange(fields);
    }
  }, [fields, onFieldsChange]);

  useEffect(() => {
    const loadHtmlContent = async () => {
      if (!pdfUrl) return;

      // Extract HTML file path from PDF URL
      const htmlPath = pdfUrl.replace('.pdf', '.html');
      
      try {
        const response = await fetch(htmlPath);
        if (!response.ok) throw new Error('Failed to load HTML content');
        
        const html = await response.text();
        setHtmlContent(html);
        setLoadError(null);
      } catch (error) {
        console.error('Error loading HTML:', error);
        setLoadError('Failed to load form content');
      }
    };

    loadHtmlContent();
  }, [pdfUrl]);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as Partial<FieldData>;
    if (data.type && data.label) {
      setActiveField({
        id: data.id || `field-${Date.now()}`,
        pageNumber: data.pageNumber ?? 1,
        type: data.type,
        label: data.label,
        x: data.x ?? 0,
        y: data.y ?? 0,
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!activeField || !event.over) return;

    // Get the iframe's content document
    const iframeDoc = iframeRef.current?.contentDocument;
    if (!iframeDoc) return;

    // Get click coordinates relative to the iframe
    const rect = iframeRef.current!.getBoundingClientRect();
    const x = event.delta.x - rect.left;
    const y = event.delta.y - rect.top;

    const updatedField = {
      ...activeField,
      x,
      y,
    };

    const index = fields.findIndex((f) => f.id === updatedField.id);
    if (index === -1) {
      setFields((prev) => [...prev, updatedField]);
    } else {
      setFields((prev) =>
        prev.map((f, i) => (i === index ? updatedField : f))
      );
    }

    setActiveField(null);
  }

  return (
    <div className="flex h-full w-full">
      <div className="w-60 border-r p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Form Fields</h3>
          <p className="text-sm text-muted-foreground">
            Drag fields onto the form
          </p>
        </div>

        <div className="space-y-2">
          {TOOLBAR_ITEMS.map((item) => (
            <ToolbarItem key={item.type} type={item.type} label={item.label} />
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Zoom</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale((prev) => Math.max(prev - 0.25, 0.5))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale((prev) => Math.min(prev + 0.25, 3))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        {loadError && (
          <div className="text-destructive p-4">
            Error loading form: {loadError}
          </div>
        )}

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="relative mx-auto my-4">
            {htmlContent ? (
              <iframe
                ref={iframeRef}
                srcDoc={htmlContent}
                className="w-full min-h-[842px] border-0 shadow-lg"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
              />
            ) : (
              <div className="flex items-center justify-center h-[842px] bg-white">
                <p className="text-muted-foreground">Loading form content...</p>
              </div>
            )}

            {fields.map((field) => (
              <OverlayField
                key={field.id}
                field={field}
                scale={scale}
              />
            ))}

            <DragOverlay>
              {activeField && <FieldPreview field={activeField} />}
            </DragOverlay>
          </div>
        </DndContext>
      </div>
    </div>
  );
}

function ToolbarItem({ type, label }: { type: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `toolbar-${type}`,
    data: { type, label },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border rounded-md p-3 bg-white cursor-grab hover:border-primary transition-colors",
        "active:cursor-grabbing"
      )}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      {...attributes}
      {...listeners}
    >
      {label}
    </div>
  );
}

interface OverlayFieldProps {
  field: FieldData;
  scale: number;
}

function OverlayField({ field, scale }: OverlayFieldProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: field.id,
    data: field,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute border border-primary bg-white/80 px-2 py-1 cursor-move",
        "hover:border-primary/80"
      )}
      style={{
        top: field.y,
        left: field.x,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      {field.label}
    </div>
  );
}

function FieldPreview({ field }: { field: FieldData }) {
  return (
    <div className="border border-dashed border-primary bg-background/80 px-2 py-1">
      {field.label}
    </div>
  );
}
