"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExtractedTextDisplayProps {
  extractedText: string | null;
  onCopy: () => void;
  isLoading: boolean;
}

export function ExtractedTextDisplay({ extractedText, onCopy, isLoading }: ExtractedTextDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Extracted Text</CardTitle>
        <CardDescription>Text identified in the image by AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Extracting text...</p>
          </div>
        ) : extractedText !== null ? (
          <>
            <ScrollArea className="h-32 w-full rounded-md border p-2">
              <pre className="text-sm whitespace-pre-wrap break-words">{extractedText}</pre>
            </ScrollArea>
            <Button onClick={onCopy} className="w-full">
              <Copy className="mr-2 h-4 w-4" /> Copy Extracted Text
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground h-24 flex items-center justify-center">
            No text extracted yet, or the image does not contain recognizable text.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
