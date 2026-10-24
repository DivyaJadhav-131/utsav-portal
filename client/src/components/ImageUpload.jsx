import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/utils';
export function ImageUpload({ onFileChange, currentImageUrl, className, }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const handleFile = (file) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Only JPEG, PNG and WebP images are allowed');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Image must not exceed 4 MB');
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(file));
    onFileChange(file);
  };
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file)
      handleFile(file);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file)
      handleFile(file);
  };
  const clear = () => {
    setPreview(null);
    setError(null);
    onFileChange(null);
    if (inputRef.current)
      inputRef.current.value = '';
  };
  const displayImg = preview ?? currentImageUrl;
  return (<div className={cn('children-gap-y-2', className)}>
    {displayImg ? (<div className="position-relative display-inline-block">
      <img src={displayImg} alt="Event preview" className="height-40 width-full max-width-xs corner-radius-lg image-fit-cover border-default border-color-gray-200" />
      <button type="button" onClick={clear} className="position-absolute offset-right-negative-2 offset-top-negative-2 corner-radius-full background-red-500 padding-1 text-color-white on-hover-background-red-600">
        <X className="height-3-5 width-3-5" />
      </button>
    </div>) : (<div onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="display-flex height-36 cursor-pointer flex-direction-column align-items-center justify-content-center corner-radius-lg border-color-2 border-color-dashed border-color-gray-300 background-gray-50 on-hover-border-color-blue-400 on-hover-background-blue-50 animated-change-colors">
      <ImagePlus className="margin-bottom-2 height-8 width-8 text-color-gray-400" />
      <p className="font-size-sm text-color-gray-500">
        Click or drag & drop to upload
      </p>
      <p className="font-size-xs text-color-gray-400 margin-top-1">
        JPEG, PNG, WebP · max 4 MB
      </p>
    </div>)}

    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="display-none" onChange={handleChange} />

    {error && <p className="font-size-xs text-color-red-600">{error}</p>}
  </div>);
}



