/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useCallback } from "react";
import * as z from "zod";
import { cn } from "@/lib/utils";
import {
  ObjectFitType,
  ImageSchema,
  ContentImageSchema,
} from "@/lib/validation/image-schema";
import { useSelectionContext } from "@/lib/providers/selection-context";
import { getSlideNumber } from "@/lib/field-path";
import { usePagerContext } from "@/lib/providers/pager-context";
import { useFormContext } from "react-hook-form";
import {
  DocumentFormReturn,
  ElementFieldPath,
} from "@/lib/document-form-types";

export function ContentImage({
  fieldName,
  className,
}: {
  fieldName: ElementFieldPath;
  className?: string;
}) {
  const form: DocumentFormReturn = useFormContext();
  const { getValues, setValue } = form;
  const image = getValues(fieldName) as z.infer<typeof ContentImageSchema>;

  const { setCurrentPage } = usePagerContext();
  const { currentSelection, setCurrentSelection } = useSelectionContext();
  const pageNumber = getSlideNumber(fieldName);
  const source = image.source.src || "https://placehold.co/400x200";

  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  const isSelected = currentSelection === fieldName;
  const hasCustomSize = image.style.width && image.style.height;

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const currentWidth = image.style.width || rect.width;
    const currentHeight = image.style.height || rect.height;

    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: currentWidth,
      height: currentHeight,
    };
  }, [image.style.width, image.style.height]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !startPosRef.current || !resizeHandle) return;

    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;

    let newWidth = startPosRef.current.width;
    let newHeight = startPosRef.current.height;

    if (resizeHandle.includes('e')) newWidth = Math.max(50, startPosRef.current.width + deltaX);
    if (resizeHandle.includes('w')) newWidth = Math.max(50, startPosRef.current.width - deltaX);
    if (resizeHandle.includes('s')) newHeight = Math.max(50, startPosRef.current.height + deltaY);
    if (resizeHandle.includes('n')) newHeight = Math.max(50, startPosRef.current.height - deltaY);

    setValue(`${fieldName}.style.width`, newWidth);
    setValue(`${fieldName}.style.height`, newHeight);
  }, [isResizing, resizeHandle, fieldName, setValue]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
    startPosRef.current = null;
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      id={"content-image-" + fieldName}
      className={cn(
        "relative flex flex-col outline-transparent rounded-md ring-offset-background",
        currentSelection == fieldName &&
          "outline-input ring-2 ring-offset-2 ring-ring",
        hasCustomSize ? "" : "h-full w-full",
        className
      )}
      style={hasCustomSize ? {
        width: image.style.width,
        height: image.style.height,
      } : undefined}
    >
      {/* // TODO: Extract to component */}
      <img
        alt="slide image"
        src={source}
        className={cn(
          "rounded-md overflow-hidden",
          hasCustomSize 
            ? "w-full h-full"
            : image.style.objectFit == ObjectFitType.enum.Cover
            ? "w-full h-full"
            : image.style.objectFit == ObjectFitType.enum.Contain
            ? "w-fit h-fit"
            : "w-full h-full",
          image.style.objectFit == ObjectFitType.enum.Cover
            ? "object-cover"
            : image.style.objectFit == ObjectFitType.enum.Contain
            ? "object-contain"
            : ""
        )}
        style={{
          opacity: image.style.opacity / 100,
        }}
        onClick={(event) => {
          setCurrentPage(pageNumber);
          setCurrentSelection(fieldName, event);
        }}
      />
      
      {/* Resize handles */}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-nwse-resize z-10"
            onMouseDown={(e) => handleMouseDown(e, 'nw')}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-nesw-resize z-10"
            onMouseDown={(e) => handleMouseDown(e, 'ne')}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-nesw-resize z-10"
            onMouseDown={(e) => handleMouseDown(e, 'sw')}
          />
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-nwse-resize z-10"
            onMouseDown={(e) => handleMouseDown(e, 'se')}
          />
          {/* Edge handles */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-ns-resize z-10"
            onMouseDown={(e) => handleMouseDown(e, 'n')}
          />
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-ns-resize z-10"
            onMouseDown={(e) => handleMouseDown(e, 's')}
          />
          <div
            className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-ew-resize z-10"
            onMouseDown={(e) => handleMouseDown(e, 'w')}
          />
          <div
            className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-ew-resize z-10"
            onMouseDown={(e) => handleMouseDown(e, 'e')}
          />
        </>
      )}
    </div>
  );
}
