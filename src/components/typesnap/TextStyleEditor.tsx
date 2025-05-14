"use client";

import React, { useState, useEffect } from 'react';
import type { TextElementData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TextStyleEditorProps {
  selectedTextElement: TextElementData | null;
  onStyleChange: (id: string, updates: Partial<Omit<TextElementData, 'id'>>) => void;
}

export function TextStyleEditor({ selectedTextElement, onStyleChange }: TextStyleEditorProps) {
  const [text, setText] = useState('');
  const [fontSizeVW, setFontSizeVW] = useState(3);
  const [color, setColor] = useState('#333333');

  useEffect(() => {
    if (selectedTextElement) {
      setText(selectedTextElement.text);
      setFontSizeVW(selectedTextElement.fontSizeVW);
      setColor(selectedTextElement.color);
    }
  }, [selectedTextElement]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (selectedTextElement) {
      onStyleChange(selectedTextElement.id, { text: e.target.value });
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    if (!isNaN(newSize) && newSize > 0) {
      setFontSizeVW(newSize);
      if (selectedTextElement) {
        onStyleChange(selectedTextElement.id, { fontSizeVW: newSize });
      }
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
    if (selectedTextElement) {
      onStyleChange(selectedTextElement.id, { color: e.target.value });
    }
  };

  if (!selectedTextElement) {
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="text-lg">Text Editor</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Select a text element on the image to edit its properties, or add a new text element.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Edit Text Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="text-content">Content</Label>
          <Textarea
            id="text-content"
            value={text}
            onChange={handleTextChange}
            placeholder="Enter text here"
            rows={3}
          />
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
            <div>
            <Label htmlFor="font-size">Font Size (vw)</Label>
            <Input
                id="font-size"
                type="number"
                value={fontSizeVW}
                onChange={handleFontSizeChange}
                min="0.5"
                step="0.1"
            />
            </div>
            <div>
            <Label htmlFor="text-color">Color</Label>
            <Input
                id="text-color"
                type="color"
                value={color}
                onChange={handleColorChange}
                className="h-10 p-1" // Adjust padding for color input
            />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
