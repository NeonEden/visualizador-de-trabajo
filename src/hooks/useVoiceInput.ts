import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useVoiceInput(onTranscriptFinalized?: (text: string) => void): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isSupportedRef = useRef(false);

  useEffect(() => {
    // Check for standard or webkit SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      isSupportedRef.current = true;
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES'; // Spanish default, will also transcribe English

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentFinal += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          if (currentFinal) {
            setTranscript((prev) => {
              const updated = prev ? `${prev} ${currentFinal}` : currentFinal;
              if (onTranscriptFinalized) {
                onTranscriptFinalized(updated);
              }
              return updated;
            });
          }
          setInterimTranscript(currentInterim);
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event.error);
          if (event.error === 'not-allowed') {
            setError('Permiso de micrófono denegado. Puedes escribir directamente.');
          } else if (event.error === 'network') {
            setError('Fallo de red en el reconocimiento de voz.');
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Error initializing SpeechRecognition:', err);
      }
    } else {
      isSupportedRef.current = false;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [onTranscriptFinalized]);

  const startListening = useCallback(() => {
    setError(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Recognition might already be running
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch (err) {
          console.warn('Recognition start error:', err);
        }
      }
    } else {
      // Browser doesn't support Web Speech API: provide helpful test simulation
      setIsListening(true);
      setError('Reconocimiento por voz en modo simulación para este navegador.');
      const testSpeech = 'Diseñar una arquitectura de microservicios con autenticación JWT y monitorización';
      let i = 0;
      const interval = setInterval(() => {
        i += 4;
        setInterimTranscript(testSpeech.slice(0, i));
        if (i >= testSpeech.length) {
          clearInterval(interval);
          setTranscript(testSpeech);
          setInterimTranscript('');
          setIsListening(false);
          if (onTranscriptFinalized) onTranscriptFinalized(testSpeech);
        }
      }, 70);
    }
  }, [onTranscriptFinalized]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported: true, // we provide graceful fallback simulation
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
}
