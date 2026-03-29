class Menu {
  constructor() {
    this.root = document.createElement('div');
    this.root.style.position = 'fixed';
    this.root.style.inset = '0';
    this.root.style.display = 'flex';
    this.root.style.alignItems = 'center';
    this.root.style.justifyContent = 'center';
    this.root.style.background = 'radial-gradient(circle at center, rgba(10, 24, 40, 0.3), rgba(2, 6, 14, 0.88))';
    this.root.style.color = '#f1fff8';
    this.root.style.fontFamily = '"Courier New", monospace';
    this.root.style.pointerEvents = 'none';
    this.root.style.zIndex = '30';

    this.panel = document.createElement('div');
    this.panel.style.padding = '28px 36px';
    this.panel.style.border = '1px solid rgba(130, 255, 214, 0.4)';
    this.panel.style.background = 'rgba(3, 10, 18, 0.75)';
    this.panel.style.boxShadow = '0 0 40px rgba(0, 255, 174, 0.12)';
    this.panel.style.textAlign = 'center';

    this.title = document.createElement('h1');
    this.title.style.margin = '0 0 12px';
    this.title.style.fontSize = '28px';
    this.title.style.letterSpacing = '0.14em';

    this.subtitle = document.createElement('p');
    this.subtitle.style.margin = '0';
    this.subtitle.style.whiteSpace = 'pre-line';
    this.subtitle.style.lineHeight = '1.6';
    this.subtitle.style.fontSize = '14px';
    this.subtitle.style.opacity = '0.86';

    this.panel.append(this.title, this.subtitle);
    this.root.appendChild(this.panel);
    document.body.appendChild(this.root);
  }

  showTitle() {
    this.setContent('COSMIC INVADERS', 'Press Enter or Space to start\nArrow keys or A/D to move\nSpace to fire, P or Esc to pause');
    this.root.style.display = 'flex';
  }

  showPause() {
    this.setContent('PAUSED', 'Press P or Esc to resume');
    this.root.style.display = 'flex';
  }

  showGameOver({ score, highScore, wave }) {
    this.setContent('GAME OVER', `Score ${score}\nHigh ${highScore}\nReached wave ${wave}\n\nPress Enter or Space to restart`);
    this.root.style.display = 'flex';
  }

  hide() {
    this.root.style.display = 'none';
  }

  setContent(title, subtitle) {
    this.title.textContent = title;
    this.subtitle.textContent = subtitle;
  }

  dispose() {
    this.root.remove();
  }
}

export default Menu;
