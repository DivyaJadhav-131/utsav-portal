import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onFileChange: (file: File | null) => void;
  currentImageUrl?: string;
  className?: string;
}

export function ImageUpload({
  onFileChange,
  currentImageUrl,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Only JPEG, PNG and WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must not exceed 5 MB');
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(file));
    onFileChange(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setPreview(null);
    setError(null);
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayImg = preview ?? currentImageUrl;

  return (
    <div className={cn('space-y-2', className)}>
      {displayImg ? (
        <div className="relative inline-block">
          <img
            src={displayImg}
            alt="Event preview"
            className="h-40 w-full max-w-xs rounded-lg object-cover border border-gray-200"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <ImagePlus className="mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">
            Click or drag & drop to upload
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPEG, PNG, WebP · max 5 MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
