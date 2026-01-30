"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { uploadImages } from "@/lib/upload-api";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  accessToken: string;
  maxImages?: number;
  disabled?: boolean;
  error?: string;
}

export default function ImageUpload({
  value = [],
  onChange,
  accessToken,
  maxImages = 3,
  disabled = false,
  error,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = value.length < maxImages;

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !canAddMore || disabled) return;

      // Validation côté client
      const validFiles: File[] = [];
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!allowedTypes.includes(file.type)) {
          setUploadError("Seuls les fichiers jpg, png et webp sont autorisés");
          return;
        }

        if (file.size > maxSize) {
          setUploadError("Les fichiers doivent faire moins de 5 Mo");
          return;
        }

        validFiles.push(file);

        // Limiter au nombre restant
        if (value.length + validFiles.length >= maxImages) break;
      }

      if (validFiles.length === 0) return;

      setIsUploading(true);
      setUploadError(null);

      try {
        const response = await uploadImages(accessToken, validFiles);
        onChange([...value, ...response.urls]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de l'upload";
        setUploadError(message);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [accessToken, canAddMore, disabled, maxImages, onChange, value]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleClick = () => {
    if (!disabled && canAddMore) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Images ({value.length}/{maxImages})
      </label>

      {/* Zone d'upload */}
      {canAddMore && (
        <div
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"}
            ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-8 w-8 text-green-600 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm text-gray-600">Upload en cours...</span>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-10 w-10 text-gray-400 mb-2"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-green-600">Cliquez pour ajouter</span> ou glissez-déposez
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG ou WebP (max 5 Mo)
              </p>
            </>
          )}
        </div>
      )}

      {/* Prévisualisation des images */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((url, index) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 150px"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Supprimer cette image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Erreurs */}
      {(error || uploadError) && (
        <p className="text-sm text-red-500">{error || uploadError}</p>
      )}
    </div>
  );
}
