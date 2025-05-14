"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import type { TextElementData } from '@/types';
import { TextElement } from './TextElement';
import { ImageIcon } from 'lucide-react';

interface CanvasAreaProps {
  imageUrl: string | null;
  textElements: TextElementData[];
  selectedTextId: string | null;
  onSelectText: (id: string) => void;
  onUpdateTextElement: (id: string, updates: Partial<Omit<TextElementData, 'id'>>) => void;
  canvasRef: React.RefObject<HTMLDivElement>; // Ref to the direct parent of TextElements for coordinate system
}

export function CanvasArea({
  imageUrl,
  textElements,
  selectedTextId,
  onSelectText,
  onUpdateTextElement,
  canvasRef
}: CanvasAreaProps) {

  useEffect(() => {
    const img = canvasRef.current?.querySelector('img');
    if (img && canvasRef.current) {
        const setAspectRatio = () => {
            if(canvasRef.current) {
                 canvasRef.current.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
            }
        }
        if (img.complete) {
            setAspectRatio();
        } else {
            img.onload = setAspectRatio;
        }
    } else if (!imageUrl && canvasRef.current) {
        // Reset aspect ratio if no image
        canvasRef.current.style.aspectRatio = '4 / 3';
    }
  }, [imageUrl, canvasRef]);


  return (
    <div
      ref={canvasRef}
      className="w-full bg-muted/50 rounded-md shadow-inner overflow-hidden transition-all duration-300"
      // Default aspect ratio, will be overridden by image
      style={{ position: 'relative', aspectRatio: '4 / 3' }} 
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Uploaded background"
          layout="fill"
          objectFit="contain"
          className="transition-opacity duration-500 opacity-0 pointer-events-none"
          onLoadingComplete={(img) => {
            img.style.opacity = '1';
            // Aspect ratio setting moved to useEffect to handle existing img elements better
          }}
          priority // Load image faster
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
          <ImageIcon size={64} className="mb-4" />
          <p className="text-lg font-medium">Your Image Will Appear Here</p>
          <p className="text-sm">Upload an image to begin adding and editing text.</p>
        </div>
      )}
      {imageUrl && textElements.map((el) => (
        <TextElement
          key={el.id}
          {...el}
          isSelected={el.id === selectedTextId}
          onSelect={onSelectText}
          onUpdate={onUpdateTextElement}
          canvasRef={canvasRef}
        />
      ))}
    </div>
  );
}
