/**
 * Zikki Incremental — Synthesized Sound Effects Engine
 * 
 * Uses HTML5 Web Audio API to dynamically generate retro-style sound effects.
 * Works 100% offline with zero external audio assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private lastHit = 0;
  private lastKill = 0;
  private lastTick = 0;
  private lastBuy = 0;
  private lastCraft = 0;

  private musicEnabled = false;
  private musicVolume = 50;
  private musicVolumeNode: GainNode | null = null;
  private nextNoteTime = 0;
  private currentBeat = 0;
  private musicTimer: any = null;
  private activeMusicNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  private init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    // Resume context if suspended (browser security autoplays)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /** Plays a short click/tick sound (gacha rolling roulette) */
  playTick() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    if (now - this.lastTick < 0.05) return;
    this.lastTick = now;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /** Plays a low-pitched drumroll rumble for the chest shake */
  playDrumroll() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = 1.1;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now);

    // Rumble vibrato
    for (let i = 0; i < 20; i++) {
      const t = i * 0.055;
      osc.frequency.setValueAtTime(55 + (i % 2 === 0 ? 12 : -12), now + t);
    }

    // High frequency buzz filter simulation
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  /** Plays a quick satisfying click/hit sound when attacking the enemy */
  playHit() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    if (now - this.lastHit < 0.08) return;
    this.lastHit = now;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.07);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.07);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.07);
  }

  /** Plays a satisfying crash pop when an enemy is slain */
  playKill() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    if (now - this.lastKill < 0.12) return;
    this.lastKill = now;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);
    
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.18);
  }

  /** Plays a pleasant arpeggio rise when leveling up */
  playLevelUp() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      
      gain.gain.setValueAtTime(0.07, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.18);
    });
  }

  /** Plays coin shop register chimes on successful purchases */
  playBuy() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    if (now - this.lastBuy < 0.1) return;
    this.lastBuy = now;
    
    const times = [0, 0.08];
    const freqs = [987.77, 1318.51]; // B5 then E6
    
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + times[idx]);
      
      gain.gain.setValueAtTime(0.07, now + times[idx]);
      gain.gain.exponentialRampToValueAtTime(0.001, now + times[idx] + 0.22);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + times[idx]);
      osc.stop(now + times[idx] + 0.22);
    });
  }

  /** Plays metallic anvil strike sound when crafting, forging runes or upgrading items */
  playCraft() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    if (now - this.lastCraft < 0.1) return;
    this.lastCraft = now;
    
    // Metallic anvil ring
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1450, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.32);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
    
    // Spark spray (white noise)
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, now);
    noiseGain.gain.linearRampToValueAtTime(0.001, now + 0.08);
    
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  }

  /** Plays a sweeping sci-fi sound for Rebirth prestige */
  playRebirth() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(550, now + 0.7);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.7);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.7);
  }

  /** Plays a massive detuned cosmic shift chord for Ascension prestige */
  playAscension() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    
    const baseFreqs = [196.00, 293.66, 392.00, 493.88]; // G3, D4, G4, B4
    baseFreqs.forEach((freq) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);
      osc1.frequency.linearRampToValueAtTime(freq * 1.5, now + 1.4);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 1.4);
      osc2.stop(now + 1.4);
    });
  }

  /** Plays specialized sound effects for battle skills */
  playSkill(skillId: string) {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    
    if (skillId === 'slash') {
      // Slash: Swoosh swoop sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.16);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);

    } else if (skillId === 'shield') {
      // Shield: Heavy metallic ring holding steady
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.setValueAtTime(280, now + 0.04);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);

    } else if (skillId === 'storm') {
      // Storm: Crackling electric thunder bursts
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100 + Math.random() * 250, now + i * 0.075);
        gain.gain.setValueAtTime(0.05, now + i * 0.075);
        gain.gain.linearRampToValueAtTime(0.001, now + i * 0.075 + 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.075);
        osc.stop(now + i * 0.075 + 0.1);
      }
    } else {
      // Generic skill / Overdrive laser rise
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.45);
      
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.45);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  }

  /** Plays a visual reveal sound effect based on the item rarity index */
  playReveal(rarityId: string) {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const isHighRarity = ['mythic', 'celestial', 'cosmic', 'transcendent', 'divine'].includes(rarityId);
    const isMediumRarity = ['rare', 'epic', 'legendary'].includes(rarityId);

    if (isHighRarity) {
      // 🌟 GODLIKE fanfares: Massive detuned supersaw swell + high bell chime arpeggios
      const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major
      
      freqs.forEach((freq, idx) => {
        [freq, freq + 4, freq - 4].forEach(f => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now + idx * 0.04);
          osc.frequency.exponentialRampToValueAtTime(f * 2, now + idx * 0.04 + 0.85);

          gain.gain.setValueAtTime(0.035, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.85);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.85);
        });
      });

      // Ringing high-pitched celestial bells
      const bells = [1046.50, 1318.51, 1567.98, 2093.00];
      bells.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.3 + idx * 0.07);
        gain.gain.setValueAtTime(0.07, now + 0.3 + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3 + idx * 0.07 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.3 + idx * 0.07);
        osc.stop(now + 0.3 + idx * 0.07 + 0.6);
      });

    } else if (isMediumRarity) {
      // 🏆 EPIC fanfare: Ascending energetic synthesizer sweep
      const freqs = [329.63, 392.00, 493.88, 587.33, 659.25]; // E minor 7 chords
      
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        osc.frequency.linearRampToValueAtTime(freq * 1.5, now + idx * 0.05 + 0.55);

        gain.gain.setValueAtTime(0.05, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.05 + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.55);
      });

    } else if (rarityId === 'uncommon' || rarityId === 'common') {
      // 📦 COMMON/UNCOMMON arpeggio: Brief happy tri-tone chime
      const notes = [261.63, 329.63, 392.00]; // C4, E4, G4
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.07, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.22);
      });
    } else {
      // 🗑️ POOR: Short dull synth pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  setMusicEnabled(enabled: boolean) {
    if (this.musicEnabled === enabled) return;
    this.musicEnabled = enabled;
    
    if (enabled) {
      this.init();
      if (!this.ctx) return;
      const ctx = this.ctx;
      
      if (!this.musicVolumeNode) {
        this.musicVolumeNode = ctx.createGain();
        this.musicVolumeNode.connect(ctx.destination);
      }
      this.musicVolumeNode.gain.setValueAtTime((this.musicVolume / 100) * 0.15, ctx.currentTime);
      this.nextNoteTime = ctx.currentTime;
      this.currentBeat = 0;
      
      if (this.musicTimer) clearInterval(this.musicTimer);
      this.musicTimer = setInterval(() => this.scheduler(), 50);
    } else {
      if (this.musicTimer) {
        clearInterval(this.musicTimer);
        this.musicTimer = null;
      }
      // Stop and clean up any playing nodes
      this.activeMusicNodes.forEach(node => {
        try {
          node.osc.stop();
          node.osc.disconnect();
          node.gain.disconnect();
        } catch (e) {
          // ignore
        }
      });
      this.activeMusicNodes = [];
    }
  }

  setMusicVolume(volume: number) {
    this.musicVolume = volume;
    if (this.ctx && this.musicVolumeNode) {
      this.musicVolumeNode.gain.setValueAtTime((volume / 100) * 0.15, this.ctx.currentTime);
    }
  }

  private scheduleNote(beat: number, time: number) {
    if (!this.ctx || !this.musicVolumeNode) return;
    const ctx = this.ctx;

    let bassFreq = 130.81; // C3
    let melodyFreqs = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

    const measure = Math.floor(beat / 4);
    const step = beat % 4;

    if (measure === 0) {
      bassFreq = 130.81;
      melodyFreqs = [261.63, 329.63, 392.00, 523.25];
    } else if (measure === 1) {
      bassFreq = 98.00;
      melodyFreqs = [246.94, 293.66, 392.00, 493.88];
    } else if (measure === 2) {
      bassFreq = 110.00;
      melodyFreqs = [220.00, 261.63, 329.63, 440.00];
    } else if (measure === 3) {
      bassFreq = 87.31;
      melodyFreqs = [174.61, 220.00, 261.63, 349.23];
    }

    if (step === 0 || step === 2) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(bassFreq, time);

      bassGain.gain.setValueAtTime(0.0, time);
      bassGain.gain.linearRampToValueAtTime(0.08, time + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.7);

      bassOsc.connect(bassGain);
      bassGain.connect(this.musicVolumeNode);

      bassOsc.start(time);
      bassOsc.stop(time + 0.7);

      const nodeRecord = { osc: bassOsc, gain: bassGain };
      this.activeMusicNodes.push(nodeRecord);
      setTimeout(() => {
        this.activeMusicNodes = this.activeMusicNodes.filter(n => n !== nodeRecord);
      }, 800);
    }

    const melodyOsc = ctx.createOscillator();
    const melodyGain = ctx.createGain();

    melodyOsc.type = 'triangle';
    const noteIndex = step === 3 ? 1 : step;
    const freq = melodyFreqs[noteIndex];
    melodyOsc.frequency.setValueAtTime(freq, time);

    melodyGain.gain.setValueAtTime(0.0, time);
    melodyGain.gain.linearRampToValueAtTime(0.04, time + 0.03);
    melodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    melodyOsc.connect(melodyGain);
    melodyGain.connect(this.musicVolumeNode);

    melodyOsc.start(time);
    melodyOsc.stop(time + 0.35);

    const nodeRecord = { osc: melodyOsc, gain: melodyGain };
    this.activeMusicNodes.push(nodeRecord);
    setTimeout(() => {
      this.activeMusicNodes = this.activeMusicNodes.filter(n => n !== nodeRecord);
    }, 450);
  }

  private scheduler() {
    if (!this.ctx || !this.musicEnabled) return;
    const lookAhead = 0.2;
    while (this.nextNoteTime < this.ctx.currentTime + lookAhead) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.currentBeat = (this.currentBeat + 1) % 16;
      this.nextNoteTime += 0.45;
    }
  }
}

export const sounds = new SoundEngine();
