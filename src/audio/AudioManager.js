class AudioManager {
  constructor() {
    this.context = null;
    this.enabled = typeof window !== 'undefined';
  }

  async resume() {
    if (!this.enabled) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      this.enabled = false;
      return;
    }

    if (!this.context) {
      this.context = new AudioCtx();
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  playShoot() {
    this.beep({ frequency: 660, duration: 0.05, type: 'square', gain: 0.03 });
  }

  playEnemyShoot() {
    this.beep({ frequency: 220, duration: 0.08, type: 'sawtooth', gain: 0.025 });
  }

  playExplosion() {
    this.beep({ frequency: 110, duration: 0.18, type: 'triangle', gain: 0.04, slideTo: 40 });
  }

  playPowerUp() {
    this.beep({ frequency: 520, duration: 0.2, type: 'sine', gain: 0.03, slideTo: 880 });
  }

  playPlayerHit() {
    this.beep({ frequency: 180, duration: 0.2, type: 'square', gain: 0.04, slideTo: 90 });
  }

  playWaveClear() {
    this.beep({ frequency: 440, duration: 0.25, type: 'triangle', gain: 0.035, slideTo: 660 });
  }

  playGameOver() {
    this.beep({ frequency: 260, duration: 0.5, type: 'sawtooth', gain: 0.035, slideTo: 120 });
  }

  beep({ frequency, duration, type, gain, slideTo }) {
    if (!this.context || this.context.state !== 'running') return;

    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }

    envelope.gain.setValueAtTime(gain, now);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(envelope);
    envelope.connect(this.context.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }
}

export default AudioManager;
