// hooks/useSpeechSynthesis.js
import { useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const speak = useCallback((text, rate = 1.0, pitch = 1.0) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }, []);

  return { speak, stopSpeaking };
};