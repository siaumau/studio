"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { TextElementData } from '@/types';

interface TextElementProps extends TextElementData {
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<TextElementData, 'id'>>) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export function TextElement({
  id,
  text,
  x,
  y,
  fontSizeVW,
  color,
  isSelected,
  onSelect,
  onUpdate,
  canvasRef,
}: TextElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const [editableText, setEditableText] = useState(text);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setEditableText(text);
  }, [text]);

  const handleMouseDown = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!isSelected) {
      onSelect(id);
    }
    // Only allow dragging if the mousedown is not on contentEditable part when selected
    // Or always allow drag if not selected (will become selected first)
    // For simplicity, let's enable dragging
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x, y });
    e.preventDefault(); // Prevents text selection if not editing
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !canvasRef.current || !textRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elementRect = textRef.current.getBoundingClientRect();

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const newXCanvasPx = (initialPos.x / 100) * canvasRect.width + dx;
    const newYCanvasPx = (initialPos.y / 100) * canvasRect.height + dy;
    
    let newXPercent = (newXCanvasPx / canvasRect.width) * 100;
    let newYPercent = (newYCanvasPx / canvasRect.height) * 100;

    // Clamp position so the element stays within canvas boundaries
    const elementWidthPercent = (elementRect.width / canvasRect.width) * 100;
    const elementHeightPercent = (elementRect.height / canvasRect.height) * 100;

    newXPercent = Math.max(0, Math.min(newXPercent, 100 - elementWidthPercent));
    newYPercent = Math.max(0, Math.min(newYPercent, 100 - elementHeightPercent));
    
    // Handle NaN cases if elementRect width/height is 0 initially
    if (isNaN(newXPercent)) newXPercent = initialPos.x;
    if (isNaN(newYPercent)) newYPercent = initialPos.y;


    onUpdate(id, { x: newXPercent, y: newYPercent });
  }, [isDragging, dragStart, initialPos, id, onUpdate, canvasRef, textRef]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTextBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newText = e.currentTarget.innerText;
    if (newText !== text) {
      onUpdate(id, { text: newText });
    }
  };
  
  // Ensure focus when selected for editing
  useEffect(() => {
    if (isSelected && textRef.current) {
      // textRef.current.focus(); // This can be disruptive if selection is just for styling
    }
  }, [isSelected]);

  return (
    <span
      ref={textRef}
      contentEditable={isSelected}
      suppressContentEditableWarning
      onMouseDown={handleMouseDown}
      onClick={() => {if (!isSelected) onSelect(id)}} // Select only if not already selected
      onBlur={handleTextBlur}
      className="absolute p-1 transition-all duration-100 ease-in-out focus:outline-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        fontSize: `${fontSizeVW}vw`,
        color: color,
        cursor: isDragging ? 'grabbing' : (isSelected ? 'text' : 'grab'),
        border: isSelected ? '1px dashed hsl(var(--primary))' : '1px dashed transparent',
        whiteSpace: 'pre-wrap', // Allows multiline text
        userSelect: isDragging ? 'none' : 'auto',
        minWidth: '20px', // ensure small text elements are still draggable
        minHeight: '20px',
        lineHeight: '1.2', // Ensure proper line height for multi-line text
      }}
      // To allow editing, we need to update the innerHTML when `editableText` changes
      // But React prefers controlled components. `contentEditable` is tricky.
      // Using `key={editableText}` on a child or dangerouslySetInnerHTML are options,
      // but simple state `editableText` for `innerText` on blur is usually sufficient.
      // For this, we rely on the `text` prop feeding `editableText` initially.
    >
      {editableText}
    </span>
  );
}
