class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = true;
    this.ambientOsc = null;
    this.ambientGain = null;
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.5;
      
      // Start ambient drone
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();
      
      this.ambientOsc.type = 'sine';
      this.ambientOsc.frequency.value = 55; // Low bass drone
      
      this.ambientGain.gain.value = 0; // Starts silent
      
      this.ambientOsc.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);
      this.ambientOsc.start();
    } catch (e) {
      console.warn("Web Audio API not supported.", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (!this.ctx) this.init();
    
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime, 0.5);
    }
    return this.isMuted;
  }

  setAmbientIntensity(threatLevel) { // 0.0 to 1.0
    if (this.isMuted || !this.ctx || !this.ambientOsc) return;
    // Increase pitch and volume based on threat level
    const targetFreq = 55 + (threatLevel * 40);
    this.ambientOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 2.0);
  }

  playPacketSound(severity) {
    if (this.isMuted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    let freq = 200;
    let type = 'sine';
    let duration = 0.1;

    switch(severity) {
      case 'CRITICAL':
        freq = 880;
        type = 'square';
        duration = 0.3;
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        break;
      case 'HIGH':
        freq = 440;
        type = 'sawtooth';
        duration = 0.15;
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        break;
      case 'MEDIUM':
        freq = 300;
        type = 'triangle';
        duration = 0.1;
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        break;
      default:
        freq = 200;
        type = 'sine';
        duration = 0.05;
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        break;
    }

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    // Envelope
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }
}

export const audioEngine = new AudioEngine();
