'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import { IconTrash } from '@/components/ui/Icons';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
}

export function ImageUploader({
  value = [],
  onChange,
  multiple = true,
  label = 'Imágenes del Producto (Arrastra o selecciona archivos)',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.error('Por favor selecciona solo archivos de imagen (PNG, JPG, WebP, etc.).');
      return;
    }

    const readPromises = validFiles.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises)
      .then((newBase64Urls) => {
        if (multiple) {
          onChange([...value, ...newBase64Urls]);
        } else {
          onChange([newBase64Urls[0]]);
        }
        toast.success(`${newBase64Urls.length} imagen(es) cargada(s).`);
      })
      .catch(() => toast.error('Error al procesar la imagen.'));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (multiple) {
      onChange([...value, urlInput.trim()]);
    } else {
      onChange([urlInput.trim()]);
    }
    setUrlInput('');
    toast.success('URL de imagen añadida.');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      {label && <label className="label">{label}</label>}

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-gold bg-gold/10 scale-[1.01]'
            : 'border-line bg-mist/50 hover:border-gold hover:bg-gold/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold-dark group-hover:scale-110 transition-transform">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <p className="text-xs font-bold text-ink">
          Arrastra y suelta tus archivos de imagen aquí, o <span className="text-gold-dark underline">Haz clic para buscar</span>
        </p>
        <p className="mt-1 text-[11px] text-charcoal/60">
          Soporta PNG, JPG, WebP, GIF (múltiples imágenes)
        </p>
      </div>

      {/* Manual URL Input Fallback */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="O pega una URL de imagen directa (ej. https://...)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="input text-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddUrl();
            }
          }}
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-ink hover:bg-mist"
        >
          Añadir URL
        </button>
      </div>

      {/* Image Thumbnails Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 pt-2">
          {value.map((url, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-mist shadow-xs">
              <Image
                src={url}
                alt={`Imagen ${idx + 1}`}
                fill
                sizes="100px"
                className="object-cover"
                unoptimized={url.startsWith('data:')}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(idx);
                }}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-ivory opacity-90 transition-opacity hover:opacity-100"
                title="Eliminar imagen"
              >
                <IconTrash size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

