import * as THREE from 'three';
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
  const audioManager = new AudioManager();
  const hud = new HUD();
  const menu = new Menu();

  // EffectComposer only works with WebGLRenderer — skip PostFX on WebGPU
  let postFX = null;
  if (renderer.isWebGL) {
    postFX = new PostFX(renderer.renderer, renderer.scene, renderer.camera);

    const syncPostFXSize = () => {
      // Use getSize() for logical pixels — domElement.width includes devicePixelRatio
      const size = renderer.renderer.getSize(new THREE.Vector2());
      postFX.setSize(size.x, size.y);
    };

    syncPostFXSize();
    window.addEventListener('resize', syncPostFXSize);
  }

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
