"use client";

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (imageDataUrl: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageUpload, onUploadStart, onUploadEnd, disabled }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload an image file (e.g., PNG, JPG, GIF).',
        });
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      onUploadStart?.();
      setIsProcessing(true);
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onImageUpload(reader.result);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to read image data.',
          });
        }
        setIsProcessing(false);
        onUploadEnd?.();
        if (inputRef.current) inputRef.current.value = ""; 
      };

      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An error occurred while reading the file.',
        });
        setIsProcessing(false);
        onUploadEnd?.();
        if (inputRef.current) inputRef.current.value = "";
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload-input">Upload Image</Label>
      <Input
        id="image-upload-input"
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*"
        disabled={disabled || isProcessing}
      />
      <Button 
        onClick={handleButtonClick} 
        disabled={disabled || isProcessing} 
        className="w-full"
        variant="outline"
      >
        <UploadCloud className="mr-2 h-4 w-4" />
        {isProcessing ? 'Processing...' : 'Choose Image'}
      </Button>
    </div>
  );
}
