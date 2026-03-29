class HUD {
  constructor() {
    this.root = document.createElement('div');
    this.root.style.position = 'fixed';
    this.root.style.left = '0';
    this.root.style.top = '0';
    this.root.style.width = '100%';
    this.root.style.display = 'flex';
    this.root.style.justifyContent = 'space-between';
    this.root.style.padding = '16px 20px';
    this.root.style.boxSizing = 'border-box';
    this.root.style.pointerEvents = 'none';
    this.root.style.color = '#d9fff4';
    this.root.style.fontFamily = '"Courier New", monospace';
    this.root.style.fontSize = '14px';
    this.root.style.textTransform = 'uppercase';
    this.root.style.letterSpacing = '0.08em';
    this.root.style.textShadow = '0 0 10px rgba(0, 255, 170, 0.35)';
    this.root.style.zIndex = '20';

    this.left = document.createElement('div');
    this.right = document.createElement('div');
    this.right.style.textAlign = 'right';

    this.root.append(this.left, this.right);
    document.body.appendChild(this.root);
  }

  update({ score, lives, wave, highScore, combo }) {
    this.left.textContent = `Score ${score}  Lives ${lives}  Wave ${wave}`;
    this.right.textContent = `High ${highScore}  Combo x${Math.max(1, combo)}`;
  }

  setVisible(visible) {
    this.root.style.display = visible ? 'flex' : 'none';
  }

  dispose() {
    this.root.remove();
  }
}

export default HUD;
