"use client";

import React, { useState, useRef } from "react";
import { Upload, Camera, AlertCircle } from "lucide-react";
import { normaliseImage } from "@/lib/image";
import { ScanInput } from "@/types/scan";
import { BrutButton } from "@/components/ui/BrutButton";

export interface ImageDropzoneProps {
  onImageSelected: (input: ScanInput) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageSelected,
  onError,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith("image/") && !file.name.match(/\.(jpe?g|png|webp|heic)$/i)) {
      onError("Please upload an image file (JPG, PNG, WebP).");
      return;
    }

    try {
      setIsProcessing(true);
      const scanInput = await normaliseImage(file, file.name);
      onImageSelected(scanInput);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process image.";
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isProcessing) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="w-full">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative block w-full bg-white border-[4px] border-black p-6 sm:p-10 cursor-pointer shadow-[6px_6px_0_0_#000] sm:shadow-[8px_8px_0_0_#000] transition-all duration-75 select-none ${
          isDragging ? "bg-[#CCFF00] -translate-x-[2px] -translate-y-[2px] shadow-[10px_10px_0_0_#000]" : ""
        } ${disabled || isProcessing ? "opacity-60 cursor-not-allowed" : "hover:-translate-x-[1px] hover:-translate-y-[1px]"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          capture="environment"
          className="sr-only"
          disabled={disabled || isProcessing}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Dashed inner border and dot pattern container */}
        <div className="w-full border-[3px] border-dashed border-black p-6 sm:p-8 bg-dots flex flex-col items-center justify-center text-center gap-4 bg-white/90">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#CCFF00] border-[3px] border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center text-black">
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
          </div>

          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="t-h3 font-black text-black">
              {isProcessing ? "NORMALISING PHOTO..." : "UPLOAD OR SHOOT STREET"}
            </h3>
            <p className="text-xs sm:text-sm font-mono text-black/80 font-medium">
              Stand on the sidewalk. Shoot down the street at eye level. Get the road, buildings, and sky in frame.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <BrutButton
              type="button"
              variant="ink"
              size="sm"
              disabled={disabled || isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload className="w-4 h-4 mr-1 stroke-[3]" />
              SELECT PHOTO
            </BrutButton>
          </div>

          <div className="text-[0.65rem] sm:text-[0.75rem] font-mono text-black/60 uppercase tracking-wider font-bold">
            JPG, PNG, WEBP · MAX 1024PX PROCESSED ON-DEVICE · 0 BYTES UPLOADED
          </div>
        </div>
      </label>
    </div>
  );
};
