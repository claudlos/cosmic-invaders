# Cosmic Invaders — Multi-Agent Build Plan

## Goal

Build a Space Invaders-style arcade game with advanced Three.js + WebGPU graphics as a **test project for the smux multi-agent workspace**. The primary purpose is to stress-test agent collaboration (Hermes/Claude/Codex/Nemotron) while producing a polished, playable game.

## Metrics We're Tracking

### Agent Performance Metrics
- **Response time** per agent per task (wall clock)
- **Token usage** (context consumed) per agent
- **Tool calls** per task
- **Success rate** — did the task complete without human intervention?
- **Handoff count** — how many times did agents message each other?
- **Error/retry count** — how many tool call failures or corrections?

### Game Quality Metrics
- Frame rate (target: 60fps at 1080p)
- WebGPU shader compile time
- Asset load time
- Code coverage (if tests written)
- Lines of code per module

## Architecture

```
cosmic-invaders/
├── index.html              # Entry point
├── package.json            # Dev server + deps
├── vite.config.js          # Vite bundler config
├── src/
│   ├── main.js             # App bootstrap, renderer init
│   ├── game/
│   │   ├── Game.js         # Game loop, state machine
│   │   ├── Player.js       # Player ship (movement, shooting)
│   │   ├── Invader.js      # Enemy entity
│   │   ├── InvaderGrid.js  # Formation management, wave logic
│   │   ├── Bullet.js       # Projectile (player + enemy)
│   │   ├── Barrier.js      # Destructible shields
│   │   ├── PowerUp.js      # Drops from enemies
│   │   ├── Collision.js    # Hit detection
│   │   └── Score.js        # Scoring, lives, HUD
│   ├── graphics/
│   │   ├── Renderer.js     # Three.js + WebGPU setup
│   │   ├── ShaderLib.js    # Custom WGSL shaders
│   │   ├── ParticleSystem.js  # GPU particle explosions
│   │   ├── PostFX.js       # Bloom, CRT scanlines, chromatic aberration
│   │   ├── Background.js   # Starfield, nebula, parallax
│   │   └── Models.js       # 3D ship/invader geometry
│   ├── audio/
│   │   ├── AudioManager.js # Web Audio API, SFX, music
│   │   └── sounds/         # .wav/.mp3 assets
│   ├── ui/
│   │   ├── HUD.js          # Score, lives, wave display
│   │   ├── Menu.js         # Title screen, game over
│   │   └── styles.css      # UI styling
│   └── utils/
│       ├── Input.js        # Keyboard/gamepad input
│       ├── Config.js       # Game constants
│       └── Pool.js         # Object pooling
├── docs/
│   ├── metrics.md          # Agent performance log
│   ├── architecture.md     # Design decisions
│   └── screenshots/        # Progress captures
└── tests/
    ├── collision.test.js
    └── game-logic.test.js
```

## Agent Assignments

### Phase 1: Scaffolding (Tasks 1-3)

| Task | Agent | Description | Est. Time |
|------|-------|-------------|-----------|
| 1.1 | **nemo-1** | Create project structure, package.json, vite config, index.html | 5 min |
| 1.2 | **nemo-1** | Create Config.js with all game constants | 3 min |
| 1.3 | **nemo-1** | Create Input.js (keyboard handler) | 3 min |

*Rationale: Scaffolding is simple boilerplate — perfect for Nemotron (free, fast).*

### Phase 2: Core Engine (Tasks 4-7)

| Task | Agent | Description | Est. Time |
|------|-------|-------------|-----------|
| 2.1 | **claude-1** | Renderer.js — Three.js WebGPU init, scene setup, camera, resize handling | 10 min |
| 2.2 | **claude-1** | Game.js — Game loop, state machine (menu/playing/paused/gameover) | 10 min |
| 2.3 | **claude-1** | Player.js — 3D ship model, movement, shooting, invincibility frames | 10 min |
| 2.4 | **claude-1** | main.js — Bootstrap, wire everything together | 5 min |

*Rationale: Core engine needs sophisticated Three.js/WebGPU knowledge — Claude Opus excels here.*

### Phase 3: Enemies & Gameplay (Tasks 8-12)

| Task | Agent | Description | Est. Time |
|------|-------|-------------|-----------|
| 3.1 | **codex-1** | Invader.js + InvaderGrid.js — Enemy types, formation, movement patterns | 10 min |
| 3.2 | **codex-1** | Bullet.js + Collision.js — Projectile system, AABB hit detection | 8 min |
| 3.3 | **codex-1** | Barrier.js — Destructible shields with per-block damage | 8 min |
| 3.4 | **codex-1** | PowerUp.js — Speed boost, multi-shot, shield drops | 5 min |
| 3.5 | **nemo-1** | Score.js — Point system, combo multiplier, high score localStorage | 3 min |

*Rationale: Codex handles bulk gameplay code. Nemotron does the simple scoring module.*

### Phase 4: Graphics & Effects (Tasks 13-17)

| Task | Agent | Description | Est. Time |
|------|-------|-------------|-----------|
| 4.1 | **claude-1** | ShaderLib.js — WGSL shaders (glow, shield energy, dissolve) | 12 min |
| 4.2 | **claude-1** | ParticleSystem.js — GPU instanced particles for explosions | 10 min |
| 4.3 | **claude-1** | PostFX.js — Bloom, CRT scanlines, chromatic aberration, vignette | 10 min |
| 4.4 | **claude-1** | Background.js — Procedural starfield, nebula layers, parallax scroll | 8 min |
| 4.5 | **claude-1** | Models.js — Procedural 3D geometry for ships/invaders (no assets needed) | 8 min |

*Rationale: Shader/graphics work is Claude's strength. All procedural — no asset files needed.*

### Phase 5: Audio & UI (Tasks 18-20)

| Task | Agent | Description | Est. Time |
|------|-------|-------------|-----------|
| 5.1 | **nemo-1** | AudioManager.js — Web Audio API, oscillator-based retro SFX | 5 min |
| 5.2 | **nemo-1** | HUD.js — Score/lives/wave HTML overlay | 3 min |
| 5.3 | **nemo-1** | Menu.js + styles.css — Title screen, game over, retro styling | 5 min |

*Rationale: Audio + UI is well-defined boilerplate — Nemotron territory.*

### Phase 6: Integration & Polish (Tasks 21-23)

| Task | Agent | Description | Est. Time |
|------|-------|-------------|-----------|
| 6.1 | **codex-1** | Integration — wire all modules together, fix imports, test in browser | 10 min |
| 6.2 | **codex-1** | Bug fixes — review console errors, fix collision edge cases | 10 min |
| 6.3 | **claude-1** | Final polish — tune particles, adjust difficulty curve, add wave transitions | 10 min |

### Phase 7: Review & Metrics (Tasks 24-25)

| Task | Agent | Description | Est. Time |
|------|-------|-------------|-----------|
| 7.1 | **codex-1** | Code review — review entire codebase for quality | 8 min |
| 7.2 | **nemo-1** | Write metrics.md — compile all agent performance data | 5 min |

## Task Execution Protocol

For each task:
1. **Hermes (orchestrator)** dispatches task via tmux-bridge to assigned agent
2. **Timer starts** when message is sent
3. **Agent works** autonomously (reading files, writing code, running commands)
4. **Timer stops** when agent completes and is idle
5. **Hermes reads** the agent's pane to capture output and verify completion
6. **Metrics logged** to docs/metrics.md

## Success Criteria

- [ ] Game loads and runs at 60fps in Chrome/Firefox with WebGPU
- [ ] Player can move, shoot, and destroy invaders
- [ ] Invaders march in formation and speed up as count decreases
- [ ] Destructible barriers
- [ ] At least 3 enemy types
- [ ] Particle explosions on kills
- [ ] Post-processing effects (bloom + CRT)
- [ ] Score tracking with high score persistence
- [ ] Sound effects
- [ ] Title screen and game over screen
- [ ] All agents contributed to the final product
- [ ] Complete metrics document with per-agent performance data

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| WebGPU not available in browser | Fall back to WebGL2 renderer |
| Nemotron generates broken code | Claude/Codex review & fix in Phase 6 |
| Agent pane crashes | restart-agent function in smux |
| Context overflow on long sessions | Monitor context %, restart agents if >80% |
| Inter-agent messaging delays | Hermes orchestrates, no agent-to-agent needed |

## Open Questions

- Should we add multiplayer (WebSocket) as a stretch goal?
- Gamepad support priority?
- Target mobile browser support?
