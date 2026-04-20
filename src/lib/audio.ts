export const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
      // Fast attack
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.03);
      // Exponential decay
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // A pleasant "ding-ding" (Major 3rd interval: E5 to G#5 or similar crisp intervals)
    // Here we use a sequence of two crisp notes
    playNote(659.25, 0, 0.4);      // E5
    // Musical Jingle: "Book my Sa-lon"
    // Rhythm: Da-da-DAAA-DAAA (1 2 3-4)
    // Notes: C5, D5, G5, E5 (or similar bright sequence)
    
    // "Book"
    playNote(523.25, 0, 0.15);     // C5
    // "my"
    playNote(587.33, 0.15, 0.1);   // D5
    // "Sa-"
    playNote(783.99, 0.3, 0.4);    // G5 (High impact)
    // "-lon"
    playNote(659.25, 0.6, 0.5);    // E5 (Resolution)

  } catch (error) {
    console.error('Failed to play success sound:', error);
  }
};
