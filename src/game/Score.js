import CONFIG from '../utils/Config';

export default class Score {
  constructor() {
    this.score = 0;
    this.lives = CONFIG.PLAYER.LIVES;
    this.wave = 1;
    this.combo = 0;
    this.comboTimer = 0;
    this.highScore = Number(localStorage.getItem('cosmicInvadersHighScore')) || 0;
    this.reset();
  }

  addKill(type) {
    const points = CONFIG.SCORING[type] || CONFIG.SCORING.BASIC;
    this.score += points * Math.pow(1 / CONFIG.SCORING.COMBO_WINDOW, this.combo);
    this.combo++;
    
    this.comboTimer = Math.min(1000, 1000 / (1 / CONFIG.SCORING.COMBO_WINDOW) * CONFIG.SCORING.COMBO_WINDOW);
  }

  loseLife() {
    if (this.lives > 0) {
      this.lives--;
      if (this.lives <= 0) {
        this.reset();
      }
    }
  }

  nextWave() {
    this.wave++;
  }

  getHighScore() {
    return this.highScore;
  }

  saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('cosmicInvadersHighScore', this.highScore);
    }
  }

  reset() {
    this.score = 0;
    this.combo = 0;
    this.lives = CONFIG.PLAYER.LIVES;
    this.wave = 1;
    this.comboTimer = 0;
  }

  update() {
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.saveHighScore();
        this.combo = 0;
      }
    }
  }
}