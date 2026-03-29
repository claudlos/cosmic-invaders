import Renderer from './graphics/Renderer.js';
import Game from './game/Game.js';
import Input from './utils/Input.js';

async function main() {
  const renderer = new Renderer();
  await renderer.init();

  const input = new Input();
  const game = new Game(renderer, input);

  console.log('Cosmic Invaders ready — press Enter or Space to start');
  game.start();
}

main().catch(console.error);
