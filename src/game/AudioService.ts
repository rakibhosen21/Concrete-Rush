
export class AudioService {
  private static ctx: AudioContext | null = null;
  private static isMuted = false;
  private static engineOsc: OscillatorNode | null = null;
  private static engineGain: GainNode | null = null;

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
    } else if (this.engineOsc) {
      this.startEngine();
    }
    return this.isMuted;
  }

  static playCollect() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx!.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.1);
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
