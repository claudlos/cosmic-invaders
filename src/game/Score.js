import CONFIG from '../utils/Config.js';

const SCORE_BY_TYPE = {
  basic: CONFIG.SCORING.BASIC,
  tough: CONFIG.SCORING.TOUGH,
  elite: CONFIG.SCORING.ELITE,
};

class Score {
  constructor() {
    this.highScore = Number(localStorage.getItem('cosmicInvadersHighScore')) || 0;
    this.reset();
  }

  addKill(type) {
    const now = performance.now();
    const withinComboWindow = now - this.lastKillAt <= CONFIG.SCORING.COMBO_WINDOW;

    this.combo = withinComboWindow ? this.combo + 1 : 1;
    this.lastKillAt = now;
    this.comboTimer = CONFIG.SCORING.COMBO_WINDOW;

    const baseScore = SCORE_BY_TYPE[type] ?? CONFIG.SCORING.BASIC;
    const multiplier = 1 + Math.max(0, this.combo - 1) * CONFIG.SCORING.COMBO_MULTIPLIER;

    this.score += Math.round(baseScore * multiplier);
    this.saveHighScore();
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
  }

  setLives(lives) {
    this.lives = Math.max(0, lives);
  }

  nextWave() {
    this.wave += 1;
    this.saveHighScore();
  }

  getHighScore() {
    return this.highScore;
  }

  saveHighScore() {
    if (this.score <= this.highScore) return;

    this.highScore = this.score;
    localStorage.setItem('cosmicInvadersHighScore', String(this.highScore));
  }

  reset() {
    this.score = 0;
    this.lives = CONFIG.PLAYER.LIVES;
    this.wave = 1;
    this.combo = 0;
    this.comboTimer = 0;
    this.lastKillAt = -Infinity;
  }

  update(dt) {
    if (this.comboTimer <= 0) return;

    this.comboTimer = Math.max(0, this.comboTimer - dt * 1000);
    if (this.comboTimer === 0) {
      this.combo = 0;
    }
  }
}

export default Score;
