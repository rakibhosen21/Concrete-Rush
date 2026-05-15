
export class AudioService {
  private static ctx: AudioContext | null = null;
  private static isMuted = false;
  private static engineOsc: OscillatorNode | null = null;
  private static engineGain: GainNode | null = null;
  
  private static musicBassGain: GainNode | null = null;
  private static musicMelodyGain: GainNode | null = null;
  private static musicInterval: any = null;

  private static init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    if (this.musicInterval) return;

    // Bass Gain
    this.musicBassGain = this.ctx!.createGain();
    this.musicBassGain.gain.setValueAtTime(0, this.ctx!.currentTime);
    this.musicBassGain.gain.linearRampToValueAtTime(0.08, this.ctx!.currentTime + 2);
    this.musicBassGain.connect(this.ctx!.destination);

    // Melody Gain
    this.musicMelodyGain = this.ctx!.createGain();
    this.musicMelodyGain.gain.setValueAtTime(0, this.ctx!.currentTime);
    this.musicMelodyGain.gain.linearRampToValueAtTime(0.05, this.ctx!.currentTime + 4);
    this.musicMelodyGain.connect(this.ctx!.destination);

    const playPulse = () => {
      const time = this.ctx!.currentTime;
      
      // Bass Sawtooth
      const bass = this.ctx!.createOscillator();
      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(55, time); // A1
      const bg = this.ctx!.createGain();
      bg.gain.setValueAtTime(0.5, time);
      bg.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
      bass.connect(bg);
      bg.connect(this.musicBassGain!);
      bass.start(time);
      bass.stop(time + 0.6);

      // Random Melody Sine
      const notes = [440, 493.88, 523.25, 587.33, 659.25]; // A4 Pentatonic
      const note = notes[Math.floor(Math.random() * notes.length)];
      const mel = this.ctx!.createOscillator();
      mel.type = 'sine';
      mel.frequency.setValueAtTime(note, time + 0.1);
      const mg = this.ctx!.createGain();
      mg.gain.setValueAtTime(0, time);
      mg.gain.linearRampToValueAtTime(0.3, time + 0.2);
      mg.gain.exponentialRampToValueAtTime(0.01, time + 0.8);
      mel.connect(mg);
      mg.connect(this.musicMelodyGain!);
      mel.start(time + 0.1);
      mel.stop(time + 1.0);
    };

    this.musicInterval = setInterval(playPulse, 600); // ~100 BPM
  }

  static stopBGM() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.musicBassGain) {
      this.musicBassGain.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + 0.5);
    }
    if (this.musicMelodyGain) {
      this.musicMelodyGain.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + 0.5);
    }
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
