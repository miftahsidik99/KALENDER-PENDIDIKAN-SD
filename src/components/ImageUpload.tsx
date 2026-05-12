import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { removeWhiteBackground } from '../lib/imageUtils';

interface ImageUploadProps {
  label: string;
  value: string | undefined;
  onChange: (base64: string) => void;
  onRemove: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onChange, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const processedImage = await removeWhiteBackground(event.target.result as string);
            onChange(processedImage);
          } catch (error) {
            console.error("Failed to process image:", error);
            // Fallback to original
            onChange(event.target.result as string);
          }
        }
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="block text-sm font-medium text-gray-600">{label}</label>
      {value ? (
        <div className="relative border border-dashed border-gray-300 rounded-lg p-2 bg-gray-50 flex items-center justify-center">
          <img src={value} alt={label} className="max-h-24 max-w-full object-contain" />
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-gray-100 text-red-500 transition-colors"
            title="Hapus gambar"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-4 bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center space-y-2 h-28"
        >
          {isProcessing ? (
            <div className="text-blue-500 text-sm font-medium">Memproses...</div>
          ) : (
            <>
              <ImageIcon size={24} className="text-gray-400" />
              <div className="text-xs text-gray-500">
                Klik untuk unggah<br />(Latar putih akan otomatis dihapus)
              </div>
            </>
          )}
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
