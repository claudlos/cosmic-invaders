# 🚀 Cosmic Invaders

A Space Invaders-style arcade game with advanced Three.js + WebGPU graphics, built entirely by **4 AI agents collaborating in real-time** via [smux](https://github.com/ShawnPana/smux).

**2,875 lines of code · 23 files · ~25 minutes · $0 API cost**

## Play

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Controls

| Key | Action |
|-----|--------|
| ← → (or A/D) | Move ship |
| Space | Shoot |
| P / Escape | Pause |
| Enter | Start / Restart |

## Features

- **WebGPU renderer** with automatic WebGL fallback
- **Post-processing pipeline** — bloom, CRT scanlines, chromatic aberration, vignette
- **GPU-instanced particles** — explosions, bullet trails, sparks
- **Procedural 3D geometry** — no external asset files needed
- **3 enemy types** — basic (green), tough (yellow), elite (red)
- **Destructible barriers** with per-block damage
- **Power-ups** — speed boost, multishot, shield
- **Combo scoring** with multiplier and localStorage high scores
- **Oscillator-based retro SFX** — Web Audio API, no audio files
- **Parallax starfield** with procedural nebula
- **Screen shake** on player hit
- **Progressive difficulty** — faster enemies, higher fire rate per wave

## Tech Stack

- [Three.js](https://threejs.org/) (WebGPU/WebGL)
- [Vite](https://vitejs.dev/) bundler
- Custom GLSL shaders
- Web Audio API
- Vanilla JS (ES modules, no framework)

## How It Was Built

This project is a **multi-agent collaboration experiment**. Four AI agents worked in parallel inside a tmux workspace, each with a specialized role:

| Agent | Model | Role | Lines Written |
|-------|-------|------|---------------|
| **nemo-1** | Nemotron 4B (local GPU, TurboQuant) | Scaffolding, config, boilerplate | ~280 |
| **claude-1** | Claude Opus 4.6 (MAX subscription) | Lead dev, graphics, shaders, bug fixes | ~1,800 |
| **codex-1** | GPT-5.4 (ChatGPT Plus) | Gameplay, integration, code review | ~800 |
| **Hermes** | Claude Opus 4.6 (orchestrator) | Planning, task dispatch, metrics | — |

Agents communicated via [tmux-bridge](https://github.com/ShawnPana/smux) for cross-pane messaging. Hermes orchestrated task dispatch, Claude handled complex architecture, Codex did bulk implementation + QA, and Nemotron handled free boilerplate tasks on a local RTX 3050 Ti.

📊 **[Full build report with metrics →](docs/build-report.html)**

## Project Structure

```
src/
├── game/           # Game logic
│   ├── Game.js         # Central game loop & state machine
│   ├── Player.js       # Player ship
│   ├── Invader.js      # Enemy entity
│   ├── InvaderGrid.js  # Formation management
│   ├── Bullet.js       # Projectiles
│   ├── Barrier.js      # Destructible shields
│   ├── Collision.js    # Hit detection
│   ├── PowerUp.js      # Drops & effects
│   └── Score.js        # Scoring & combos
├── graphics/       # Rendering
│   ├── Renderer.js     # WebGPU/WebGL setup
│   ├── ShaderLib.js    # Custom GLSL shaders
│   ├── ParticleSystem.js  # GPU instanced particles
│   ├── PostFX.js       # Post-processing chain
│   ├── Background.js   # Parallax starfield
│   └── Models.js       # Procedural 3D geometry
├── audio/
│   └── AudioManager.js # Oscillator-based SFX
├── ui/
│   ├── HUD.js          # Score/lives overlay
│   ├── Menu.js         # Title/gameover screens
│   └── styles.css      # Retro neon styling
└── utils/
    ├── Config.js       # Game constants
    ├── Input.js        # Keyboard handler
    └── Pool.js         # Object pooling
```

## Contributors

- **[claudlos](https://github.com/claudlos)** — Project creator & human overseer
- **Hermes** ([Hermes Agent](https://github.com/hermes-agent)) — Orchestrator, planning, metrics, tmux-bridge integration
- **Claude Code** ([Anthropic](https://claude.ai)) — Core engine, graphics pipeline, shaders, audio, bug fixes
- **Codex CLI** ([OpenAI](https://openai.com)) — Gameplay modules, full integration, code review (found 7 bugs)
- **Nemotron** ([NVIDIA](https://nvidia.com)) — Scaffolding, config, scoring (running locally via TurboQuant on RTX 3050 Ti)

## License

MIT
