import { useState } from 'react';
import { analyzeProductAudio } from '../services/anthropicService';

interface AudioUploadAIProps {
  onProductData: (data: {
    nombre: string;
    precio: number | null;
    stock: number | null;
    categoria: string;
  }) => void;
  onError: (error: string) => void;
}

type RecognitionEvent = Event & { results: SpeechRecognitionResultList };
type RecognitionErrorEvent = Event & { error: string };

const AudioUploadAI = ({ onProductData, onError }: AudioUploadAIProps) => {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'done'>('idle');

  const startListening = () => {
    // Verificar soporte de Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      onError('Tu navegador no soporta grabación de voz. Por favor usa Chrome, Edge o Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'es-CO'; // Español colombiano

    let finalTranscript = '';

    recognition.onstart = () => {
      setListening(true);
      setStatus('listening');
      setTranscript('');
      onError('');
    };

    recognition.onresult = (event: RecognitionEvent) => {
      let interimTranscript = '';
      
      for (let i = event.results.length - 1; i >= 0; i--) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: RecognitionErrorEvent) => {
      const errorMessages: Record<string, string> = {
        'network': 'Error de conexión. Intenta nuevamente.',
        'no-speech': 'No se detectó voz. Intenta de nuevo.',
        'audio-capture': 'No se encontró micrófono.',
      };
      
      onError(errorMessages[event.error] || `Error: ${event.error}`);
      setListening(false);
      setStatus('idle');
    };

    recognition.onend = async () => {
      setListening(false);
      
      if (finalTranscript.trim()) {
        setStatus('processing');
        setProcessing(true);
        
        try {
          const result = await analyzeProductAudio(finalTranscript);
          onProductData(result);
          setStatus('done');
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error al procesar audio';
          onError(errorMessage);
          setStatus('idle');
        } finally {
          setProcessing(false);
        }
      } else {
        setStatus('idle');
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    setListening(false);
    setStatus('idle');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={startListening}
          disabled={listening || processing}
          className="flex-1 bg-sf-primary text-white py-3 rounded-lg hover:bg-sf-dark disabled:opacity-50 font-medium transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">🎙️</span>
          {listening ? 'Escuchando...' : processing ? 'Procesando...' : 'Iniciar Grabación'}
        </button>
        
        {listening && (
          <button
            onClick={stopListening}
            className="px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
          >
            Detener
          </button>
        )}
      </div>

      {/* Indicador de estado */}
      <div className="text-center">
        {status === 'listening' && (
          <div className="flex justify-center items-center gap-2 text-sf-primary">
            <div className="animate-pulse">🎙️</div>
            <span className="text-sm font-medium">Escuchando...</span>
          </div>
        )}
        
        {status === 'processing' && (
          <div className="flex justify-center items-center gap-2 text-sf-primary">
            <div className="animate-spin">⚙️</div>
            <span className="text-sm font-medium">Procesando...</span>
          </div>
        )}
        
        {status === 'done' && (
          <div className="text-green-600 text-sm font-medium">✅ Listo</div>
        )}
      </div>

      {/* Mostrar transcript */}
      {transcript && (
        <div className="bg-sf-light p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Transcripción:</p>
          <p className="text-sm text-sf-text">{transcript}</p>
        </div>
      )}

      {/* Advertencia de soporte */}
      <p className="text-xs text-gray-500 text-center">
        💡 Ejemplo: "Arroz Diana 1 kilo, precio 4200 pesos, stock 50 unidades"
      </p>
    </div>
  );
};

export default AudioUploadAI;
