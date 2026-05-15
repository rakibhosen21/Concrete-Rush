
export class AudioService {
  private static ctx: AudioContext | null = null;
  private static isMenuMuted: boolean = localStorage.getItem('landingMuted') === 'true';
  private static isGameMuted: boolean = localStorage.getItem('gameMuted') === 'true';
  private static engineOsc: OscillatorNode | null = null;
  private static engineGain: GainNode | null = null;
  
  private static reverb: ConvolverNode | null = null;
  private static musicIntervals: any[] = [];
  private static masterMusicGain: GainNode | null = null;

  static getIsMenuMuted() { return this.isMenuMuted; }
  static getIsGameMuted() { return this.isGameMuted; }

  static toggleMenuMute() {
    this.isMenuMuted = !this.isMenuMuted;
    localStorage.setItem('landingMuted', String(this.isMenuMuted));
    if (this.isMenuMuted) {
      this.stopBGM();
    } else {
      this.startMenuBGM();
    }
    return this.isMenuMuted;
  }

  static toggleLandingBGM() {
    return this.toggleMenuMute();
  }

  static toggleGameMute() {
    this.isGameMuted = !this.isGameMuted;
    localStorage.setItem('gameMuted', String(this.isGameMuted));
    if (this.isGameMuted) {
      if (this.masterMusicGain) {
        this.masterMusicGain.gain.setValueAtTime(0, this.ctx!.currentTime);
      }
      this.stopEngine();
    } else {
      if (this.masterMusicGain) {
        this.masterMusicGain.gain.setTargetAtTime(1, this.ctx!.currentTime, 0.1);
      }
      this.startGameBGM();
    }
    return this.isGameMuted;
  }

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
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        this.reverb = this.ctx.createConvolver();
        this.reverb.buffer = this.createReverb(2, 2);
        this.reverb.connect(this.ctx.destination);

        this.masterMusicGain = this.ctx.createGain();
        this.masterMusicGain.connect(this.ctx.destination);
      }
      
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch((e) => console.warn('AudioContext resume failed:', e));
      }
    } catch (e) {
      console.error('Failed to initialize AudioContext:', e);
    }
  }

  static startMenuBGM() {
    if (this.isMenuMuted) return;
    this.init();
    
    // Stop any existing BGM
    this.stopBGM();

    const ctx = this.ctx!;
    const dest = this.masterMusicGain!;
    
    if (dest) {
       dest.gain.setValueAtTime(1, ctx.currentTime);
    }
    
    // 90 BPM Settings
    const beatTime = 60 / 90;
    const eighthTime = beatTime / 2;

    const chords = [
      [130.81, 155.56, 196.00], // Cm
      [155.56, 196.00, 233.08], // Eb
      [174.61, 207.65, 261.63], // Fm
      [116.54, 146.83, 174.61]  // Bb
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
        g.gain.linearRampToValueAtTime(0.04, t + 1);
        g.gain.linearRampToValueAtTime(0, t + 4);
        osc.connect(g);
        g.connect(this.reverb!);
        g.connect(dest);
        osc.start(t);
        osc.stop(t + 4.1);
      });
      chordIdx = (chordIdx + 1) % chords.length;
    };

    const arps = [523.25, 587.33, 622.25, 698.46, 783.99]; 
    let arpIdx = 0;
    const playArp = () => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(arps[arpIdx], t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.connect(g);
      g.connect(this.reverb!);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.85);
      arpIdx = (arpIdx + 1) % arps.length;
    };

    const playKick = () => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.35);
    };

    playChord();
    this.musicIntervals.push(setInterval(playChord, beatTime * 4 * 1000));
    this.musicIntervals.push(setInterval(playArp, eighthTime * 1000));
    this.musicIntervals.push(setInterval(playKick, 2000));
  }

  static stopLandingBGM() {
    this.stopBGM();
  }

  static startGameBGM() {
    if (this.isGameMuted) return;
    this.init();
    this.stopBGM();

    const ctx = this.ctx!;
    const dest = this.masterMusicGain!;

    if (dest) {
       dest.gain.setValueAtTime(1, ctx.currentTime);
    }
    
    // 140 BPM Settings - High Energy Chase
    const beatTime = 60 / 140;
    const quarterTime = beatTime;

    const playBass = () => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(40, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.1);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      
      osc.connect(filter);
      filter.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.2);
    };

    const playSnare = () => {
      const t = ctx.currentTime;
      const noise = ctx.createBufferSource();
      const bufSize = ctx.sampleRate * 0.1;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for(let i=0; i<bufSize; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buf;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(1000, t);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      noise.connect(hp);
      hp.connect(g);
      g.connect(dest);
      noise.start(t);
    };

    const playLead = () => {
      const t = ctx.currentTime;
      const f = [110, 123.47, 130.81, 146.83][Math.floor(Math.random() * 4)] * 2;
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.03, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.2);
    };

    let step = 0;
    const sequencer = () => {
      if (step % 2 === 0) playBass();
      if (step % 4 === 2) playSnare();
      if (step % 1 === 0) playLead();
      step = (step + 1) % 16;
    };

    this.musicIntervals.push(setInterval(sequencer, (quarterTime / 2) * 1000));
  }

  static stopGameBGM() {
    this.stopBGM();
  }

  static startBGM() {
    this.startMenuBGM();
  }

  static stopBGM() {
    this.musicIntervals.forEach(interval => clearInterval(interval));
    this.musicIntervals = [];
  }

  static playCollect() {
    if (this.isGameMuted) return;
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
    if (this.isMenuMuted && this.isGameMuted) return;
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
    if (this.isGameMuted) return;
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
    if (this.isGameMuted) return;
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
    if (this.isGameMuted) return;
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
