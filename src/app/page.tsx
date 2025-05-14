"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';
import type { TextElementData } from '@/types';

import { ImageUploader } from '@/components/typesnap/ImageUploader';
import { CanvasArea } from '@/components/typesnap/CanvasArea';
import { TextStyleEditor } from '@/components/typesnap/TextStyleEditor';
import { ExtractedTextDisplay } from '@/components/typesnap/ExtractedTextDisplay';
import { FileText, Loader2, PlusCircle, TextCursorInput } from 'lucide-react';

export default function TypeSnapPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [textElements, setTextElements] = useState<TextElementData[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const canvasInnerRef = useRef<HTMLDivElement>(null); // For aspect ratio and text element bounds
  const { toast } = useToast();

  const handleImageUpload = (imageDataUrl: string) => {
    setUploadedImage(imageDataUrl);
    setTextElements([]);
    setExtractedText(null);
    setSelectedTextId(null);
    toast({ title: "Image Uploaded", description: "You can now add text or extract text from the image." });
  };

  const addTextElement = () => {
    if (!uploadedImage) return;
    // Get current foreground color for default text
    let defaultColor = '#333333'; // Fallback
    if (typeof window !== 'undefined') {
        const fgColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim();
        // This gives HSL. For simplicity, using a fixed default or enhance to convert HSL to HEX.
        // For now, let's use a fixed default that works with the theme.
    }

    const newTextElement: TextElementData = {
      id: crypto.randomUUID(),
      text: 'New Text',
      x: 40, // Default position slightly off-center
      y: 40,
      fontSizeVW: 3,
      color: defaultColor, 
    };
    setTextElements((prev) => [...prev, newTextElement]);
    setSelectedTextId(newTextElement.id);
  };

  const handleSelectText = useCallback((id: string) => {
    setSelectedTextId(id);
  }, []);

  const handleUpdateTextElement = useCallback((id: string, updates: Partial<Omit<TextElementData, 'id'>>) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  }, []);

  const handleExtractText = async () => {
    if (!uploadedImage) {
      toast({ variant: "destructive", title: "No Image", description: "Please upload an image first." });
      return;
    }
    setIsExtracting(true);
    setExtractedText(null); 
    try {
      const result = await extractTextFromImage({ photoDataUri: uploadedImage });
      setExtractedText(result.extractedText);
      if (result.extractedText && result.extractedText.trim() !== "") {
        toast({ title: "Text Extracted", description: "AI has extracted text from the image." });
      } else {
        toast({ title: "No Text Found", description: "AI could not find any text in the image." });
      }
    } catch (error) {
      console.error("Error extracting text:", error);
      toast({ variant: "destructive", title: "Extraction Failed", description: "Could not extract text from image." });
    } finally {
      setIsExtracting(false);
    }
  };

  const copyExtractedText = async () => {
    if (extractedText) {
      try {
        await navigator.clipboard.writeText(extractedText);
        toast({ title: "Success", description: "Extracted text copied to clipboard!" });
      } catch (err) {
        toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy text." });
      }
    }
  };

  const selectedTextForEditor = textElements.find(el => el.id === selectedTextId) || null;

  const isLoading = isUploading || isExtracting;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border shadow-sm sticky top-0 bg-background z-50">
        <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
                <TextCursorInput className="h-7 w-7 text-primary" />
                <h1 className="text-2xl font-semibold text-primary">TypeSnap</h1>
            </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-px bg-border overflow-hidden">
        {/* Canvas Area Wrapper - takes more space on large screens */}
        <div className="lg:col-span-8 xl:col-span-9 bg-background p-4 sm:p-6 md:p-8 flex justify-center items-center min-h-[calc(100vh-200px)] lg:min-h-0 lg:h-auto overflow-auto">
           <div className="w-full max-w-4xl"> {/* Increased max-width for larger canvas */}
             <CanvasArea
                imageUrl={uploadedImage}
                textElements={textElements}
                selectedTextId={selectedTextId}
                onSelectText={handleSelectText}
                onUpdateTextElement={handleUpdateTextElement}
                canvasRef={canvasInnerRef}
              />
           </div>
        </div>

        {/* Controls Panel */}
        <div className="lg:col-span-4 xl:col-span-3 bg-card p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-65px)]"> {/* 65px approx header height */}
          <ImageUploader
            onImageUpload={handleImageUpload}
            onUploadStart={() => setIsUploading(true)}
            onUploadEnd={() => setIsUploading(false)}
            disabled={isLoading}
          />
          
          {uploadedImage && (
            <>
              <Button onClick={addTextElement} disabled={isLoading} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Text Layer
              </Button>
              
              <TextStyleEditor
                selectedTextElement={selectedTextForEditor}
                onStyleChange={handleUpdateTextElement}
              />
              
              <Button onClick={handleExtractText} disabled={isLoading || !uploadedImage} className="w-full">
                {isExtracting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                {isExtracting ? 'Extracting Text...' : 'Extract Text from Image'}
              </Button>
              
              <ExtractedTextDisplay
                extractedText={extractedText}
                onCopy={copyExtractedText}
                isLoading={isExtracting}
              />
            </>
          )}
           {!uploadedImage && !isLoading && (
            <div className="text-center text-muted-foreground py-10">
              <p>Upload an image to start your creation.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
