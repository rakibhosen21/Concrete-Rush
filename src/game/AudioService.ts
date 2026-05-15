
export class AudioService {
  private static ctx: AudioContext | null = null;
  private static isMuted = false;
  private static engineOsc: OscillatorNode | null = null;
  private static engineGain: GainNode | null = null;
  
  private static reverb: ConvolverNode | null = null;
  private static musicIntervals: any[] = [];

  private static createReverb(duration: number, decay: number) {
    const sampleRate = this.ctx!.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx!.createBuffer(2, length, sampleRate);
    for (let i = 0; i < 2; i++) {
      const channel = impulse.getChannelData(i);
      for (let j = 0; j < length; j++) {
        channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
      }
    }
    return impulse;
  }

  private static init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.reverb = this.ctx.createConvolver();
      this.reverb.buffer = this.createReverb(2, 2);
      this.reverb.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  static toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopEngine();
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.isMuted;
  }

  static startBGM() {
    if (this.isMuted) return;
    this.init();
    if (this.musicIntervals.length > 0) return;

    const ctx = this.ctx!;
    const dest = this.reverb!;
    
    // 90 BPM Settings
    const beatTime = 60 / 90; // 0.666s
    const eighthTime = beatTime / 2;

    // 1. Smooth Chord Pads (Cm, Eb, Fm, Bb)
    const chords = [
      [130.81, 155.56, 196.00], // C3, Eb3, G3 (Cm)
      [155.56, 196.00, 233.08], // Eb3, G3, Bb3 (Eb)
      [174.61, 207.65, 261.63], // F3, Ab3, C4 (Fm)
      [116.54, 146.83, 174.61]  // Bb2, D3, F3 (Bb)
    ];
    let chordIdx = 0;

    const playChord = () => {
      const t = ctx.currentTime;
      const currentChord = chords[chordIdx];
      currentChord.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.04, t + 1); // Soft attack
        g.gain.linearRampToValueAtTime(0, t + 4);    // Long decay
        osc.connect(g);
        g.connect(dest);
        osc.start(t);
        osc.stop(t + 4.1);
      });
      chordIdx = (chordIdx + 1) % chords.length;
    };

    // 2. Gentle Arpeggio (Sine)
    const arps = [523.25, 587.33, 622.25, 698.46, 783.99]; // C5, D5, Eb5, F5, G5
    let arpIdx = 0;
    const playArp = () => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(arps[arpIdx], t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.06, t + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.85);
      arpIdx = (arpIdx + 1) % arps.length;
    };

    // 3. Subtle Kick (Every 2s)
    const playKick = () => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    };

    playChord();
    this.musicIntervals.push(setInterval(playChord, beatTime * 4 * 1000)); // Every 4 beats
    this.musicIntervals.push(setInterval(playArp, eighthTime * 1000));    // Every half beat
    this.musicIntervals.push(setInterval(playKick, 2000));                // Every 2s
  }

  static stopBGM() {
    this.musicIntervals.forEach(interval => clearInterval(interval));
    this.musicIntervals = [];
  }

  static playCollect() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx!.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.1);
  }

  static playClick() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx!.currentTime);
    
    gain.gain.setValueAtTime(0.2, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.05);
  }

  static playBoost() {
    if (this.isMuted) return;
    this.init();
    const noise = this.ctx!.createBufferSource();
    const bufferSize = this.ctx!.sampleRate * 0.5;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    noise.buffer = buffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, this.ctx!.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, this.ctx!.currentTime + 0.4);
    
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.5);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx!.destination);
    
    noise.start();
  }

  static playGameOver() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, this.ctx!.currentTime + 0.8);
    
    gain.gain.setValueAtTime(0.2, this.ctx!.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.8);
  }

  static startEngine() {
    if (this.isMuted) return;
    this.init();
    if (this.engineOsc) this.stopEngine();

    this.engineOsc = this.ctx!.createOscillator();
    this.engineGain = this.ctx!.createGain();
    
    this.engineOsc.type = 'triangle';
    this.engineOsc.frequency.setValueAtTime(60, this.ctx!.currentTime);
    
    this.engineGain.gain.setValueAtTime(0.05, this.ctx!.currentTime);
    
    this.engineOsc.connect(this.engineGain);
    this.engineGain.connect(this.ctx!.destination);
    
    this.engineOsc.start();
  }

  static stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
      } catch (e) {}
      this.engineOsc = null;
    }
  }
}
