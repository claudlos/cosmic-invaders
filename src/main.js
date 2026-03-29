import Renderer from './graphics/Renderer.js';
import Background from './graphics/Background.js';
import ParticleSystem from './graphics/ParticleSystem.js';
import PostFX from './graphics/PostFX.js';
import * as Models from './graphics/Models.js';
import Game from './game/Game.js';
import Input from './utils/Input.js';
import Score from './game/Score.js';
import InvaderGrid from './game/InvaderGrid.js';
import Player from './game/Player.js';
import AudioManager from './audio/AudioManager.js';
import HUD from './ui/HUD.js';
import Menu from './ui/Menu.js';

async function main() {
  const renderer = new Renderer();
  await renderer.init();

  const input = new Input();
  const score = new Score();
  const background = new Background(renderer.scene);
  const particleSystem = new ParticleSystem(renderer.scene);
  const postFX = new PostFX(renderer.renderer, renderer.scene, renderer.camera);
  const audioManager = new AudioManager();
  const hud = new HUD();
  const menu = new Menu();

  const syncPostFXSize = () => {
    const width = renderer.renderer.domElement.width;
    const height = renderer.renderer.domElement.height;
    postFX.setSize(width, height);
  };

  syncPostFXSize();
  window.addEventListener('resize', syncPostFXSize);

  const game = new Game(renderer, input, {
    background,
    particleSystem,
    postFX,
    audioManager,
    hud,
    menu,
    models: Models,
    score,
    classes: {
      Score,
      InvaderGrid,
      Player,
    },
  });

  game.start();
}

main().catch(console.error);
