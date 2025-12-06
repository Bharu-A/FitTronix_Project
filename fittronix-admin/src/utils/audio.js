// src/utils/audio.js
let audioContext = null;
export const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

export const playBeep = (opts = {}) => {
  try {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = opts.type || 'sine';
    oscillator.frequency.value = opts.freq || 800;
    gain.gain.value = typeof opts.volume === 'number' ? opts.volume : 0.08;

    oscillator.start();
    setTimeout(() => oscillator.stop(), opts.duration || 90);
  } catch (e) {
    // fail silently if audio not supported
    // console.warn('Audio not supported', e);
  }
};
