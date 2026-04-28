import { useState } from 'react';
import { analyzeProductImage } from '../services/anthropicService';

interface ImageUploadAIProps {
  onProductData: (data: {
    nombre: string;
    precio_sugerido: number | null;
    categoria: string;
  }) => void;
  onError: (error: string) => void;
}

const ImageUploadAI = ({ onProductData, onError }: ImageUploadAIProps) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      onError('Por favor selecciona una imagen válida');
      return;
    }

    try {
      setLoading(true);
      onError('');

      // Crear preview
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Image = event.target?.result as string;
          setImagePreview(base64Image);

          // Remover el prefijo data:image/...;base64,
          const base64Data = base64Image.split(',')[1];

          // Analizar imagen con IA
          const result = await analyzeProductImage(base64Data);
          onProductData(result);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error al analizar imagen';
          onError(errorMessage);
          setImagePreview(null);
        } finally {
          setLoading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar imagen';
      onError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-sf-cyan rounded-lg p-6 text-center hover:border-sf-primary transition">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          disabled={loading}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-sm font-medium text-sf-text">
            {loading ? 'Analizando imagen...' : 'Toca para capturar o seleccionar foto'}
          </p>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG - máximo 5MB</p>
        </label>
      </div>

      {imagePreview && (
        <div className="relative">
          <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
          {loading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-white text-sm">Procesando...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploadAI;
