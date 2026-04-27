/**
 * Servicio para interactuar con la API de Anthropic (Claude)
 * Usado para análisis de imágenes y texto de productos
 */

interface ProductAnalysisResult {
  nombre: string;
  precio_sugerido: number | null;
  categoria: string;
}

interface ProductFromAudioResult {
  nombre: string;
  precio: number | null;
  stock: number | null;
  categoria: string;
}

/**
 * Analiza una imagen de producto usando Claude Vision
 * @param imageBase64 - Imagen codificada en base64
 * @returns Datos extraídos: nombre, precio, categoría
 */
export async function analyzeProductImage(imageBase64: string): Promise<ProductAnalysisResult> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key de Anthropic no configurada. Configura VITE_ANTHROPIC_API_KEY');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `Analiza esta imagen de un producto de supermercado o tienda. 
                Extrae y devuelve SOLO un JSON con estos campos:
                { nombre: string, precio_sugerido: number, categoria: string }
                Si no puedes identificar el precio, usa null.
                Categorías posibles: Abarrotes, Bebidas, Lácteos, Limpieza, Otros
                Responde SOLO con el JSON, sin explicaciones adicionales.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en la API de Anthropic');
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      throw new Error('No se recibió respuesta de la API');
    }

    // Extraer JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const result = JSON.parse(jsonMatch[0]) as ProductAnalysisResult;
    return result;
  } catch (error) {
    console.error('Error analizando imagen:', error);
    throw error;
  }
}

/**
 * Analiza texto dictado de un producto usando Claude
 * @param transcribedText - Texto transcrito del micrófono
 * @returns Datos extraídos: nombre, precio, stock, categoría
 */
export async function analyzeProductAudio(transcribedText: string): Promise<ProductFromAudioResult> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key de Anthropic no configurada. Configura VITE_ANTHROPIC_API_KEY');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `El usuario dictó esta descripción de un producto para agregar al inventario: 
            "${transcribedText}"
            
            Extrae y devuelve SOLO un JSON con:
            { nombre: string, precio: number, stock: number, categoria: string }
            Si falta algún campo, usa null.
            Categorías posibles: Abarrotes, Bebidas, Lácteos, Limpieza, Otros
            Responde SOLO con el JSON, sin explicaciones adicionales.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en la API de Anthropic');
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      throw new Error('No se recibió respuesta de la API');
    }

    // Extraer JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const result = JSON.parse(jsonMatch[0]) as ProductFromAudioResult;
    return result;
  } catch (error) {
    console.error('Error analizando audio:', error);
    throw error;
  }
}
