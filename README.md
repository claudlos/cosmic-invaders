# 🚀 Cosmic Invaders

**A Space Invaders arcade game with Three.js + WebGPU graphics, built by 4 AI agents in ~25 minutes.**

> No human wrote a single line of game code. Four AI agents — running on a local GPU, Claude MAX, and ChatGPT Plus — collaborated in real-time through [smux](https://github.com/ShawnPana/smux) tmux panes to plan, implement, review, and debug the entire project.

<p align="center">
  <img src="https://img.shields.io/badge/Lines_of_Code-2,875-00e5ff?style=for-the-badge&labelColor=0a0a0f" />
  <img src="https://img.shields.io/badge/Source_Files-23-b388ff?style=for-the-badge&labelColor=0a0a0f" />
  <img src="https://img.shields.io/badge/Build_Time-~25_min-00ff88?style=for-the-badge&labelColor=0a0a0f" />
  <img src="https://img.shields.io/badge/API_Cost-$0-ffcc00?style=for-the-badge&labelColor=0a0a0f" />
  <img src="https://img.shields.io/badge/Agents-4-ff4466?style=for-the-badge&labelColor=0a0a0f" />
</p>

---

## 🎮 Play

```bash
git clone https://github.com/claudlos/cosmic-invaders.git
cd cosmic-invaders
npm install
npm run dev
```

Open **http://localhost:5173** — press Enter to start.

### Controls

| Key | Action |
|:---:|--------|
| `← →` or `A D` | Move ship |
| `Space` | Shoot |
| `P` / `Esc` | Pause |
| `Enter` | Start / Restart |

---

## ✨ Features

### Gameplay
- 5×11 invader formation with **3 enemy types** (basic · tough · elite)
- **Destructible barrier shields** with per-block damage
- **Power-ups** — speed boost, triple-shot, temporary shield
- **Combo scoring** with multiplier chain + localStorage high scores
- **Progressive difficulty** — enemies speed up each wave, fire more often, rush when few remain

### Graphics
- **WebGPU renderer** with automatic WebGL2 fallback
- **Post-processing pipeline** — UnrealBloom, CRT scanlines, chromatic aberration, vignette
- **GPU-instanced particles** — radial explosions, bullet trails, impact sparks
- **Procedural 3D geometry** — ships, invaders, bullets, barriers — zero asset files
- **Parallax starfield** with 3 depth layers + procedural nebula
- **Screen shake** on player hit with exponential decay

### Audio & UI
- **Oscillator-based retro SFX** via Web Audio API — no audio files
- **Neon-glow HUD** — score, lives, wave, combo multiplier
- **Animated title screen** with retro arcade styling
- Game over + pause overlays

### Tech
- [Three.js](https://threejs.org/) `r183` (WebGPU / WebGL2)
- [Vite](https://vitejs.dev/) dev server + bundler
- Custom GLSL shaders (CRT, chromatic aberration, vignette, star rendering)
- Vanilla ES modules — no framework, no build-time dependencies beyond Vite

---

## 🤖 How It Was Built

This project is a **multi-agent collaboration experiment**. Four AI agents worked simultaneously inside a [smux](https://github.com/ShawnPana/smux) tmux workspace, coordinated by Hermes via `tmux-bridge` cross-pane messaging.

### The Agent Team

| Agent | Model | Where It Runs | Role | Output |
|:-----:|-------|:-------------:|------|-------:|
| 🟢 **nemo-1** | NVIDIA Nemotron 4B | Local RTX 3050 Ti (TurboQuant turbo3) | Scaffolding, config, boilerplate | ~280 LOC |
| 🟠 **claude-1** | Claude Opus 4.6 | Anthropic MAX subscription | Lead dev — engine, shaders, graphics, fixes | ~1,800 LOC |
| 🟩 **codex-1** | GPT-5.4 | ChatGPT Plus | Gameplay, integration, code review | ~800 LOC |
| 🟣 **Hermes** | Claude Opus 4.6 | Anthropic API (orchestrator) | Planning, dispatch, metrics, debugging | — |

### Build Phases

```
Phase 1  ██░░░░░░░░  Scaffolding        nemo-1       3.5 min
Phase 2  ████░░░░░░  Core Engine        claude-1     1.5 min
Phase 3  ██████░░░░  Gameplay           codex-1      2.5 min  ← parallel with Phase 4
Phase 4  ████████░░  Graphics/Shaders   claude-1     2.5 min  ← parallel with Phase 3
Phase 5  █████████░  Audio & UI         claude-1     2.0 min  (nemo-1 failed, reassigned)
Phase 6  ██████████  Integration        codex-1      2.0 min  ← parallel with polish
Phase 7  ██████████  Review + Bug Fixes codex + claude  6.0 min
```

### Key Metrics

| Metric | Value |
|--------|------:|
| Total tasks dispatched | 14 |
| Tasks succeeded | 13 / 14 (93%) |
| Bugs found in code review | 7 (2 HIGH, 3 MED, 2 LOW) |
| Bugs fixed | 7 / 7 |
| Build verifications | 4 |
| Agent-to-agent messages | 6 |
| npm build time | 1.0s |

### What We Learned

- **Tiered models save money** — Nemotron ($0, local GPU) handles boilerplate; subscription models handle complexity
- **Claude proactively fixes other agents' bugs** — corrected 3 issues in nemo's code without being asked
- **Codex excels at code review** — found 7 real integration bugs including a critical rendering issue
- **Small models fail on complex multi-file tasks** — Nemotron hallucinated tool calls on a 4-file creation task
- **Write task prompts to files** — avoids shell quoting issues when dispatching via tmux

📊 **[Full interactive build report →](https://claudlos.github.io/cosmic-invaders/)** — detailed timeline, per-task metrics, agent performance comparison

---

## 📁 Project Structure

```
cosmic-invaders/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                 # Bootstrap
│   ├── game/
│   │   ├── Game.js             # Game loop & state machine (361 LOC)
│   │   ├── Player.js           # Ship movement & shooting
│   │   ├── Invader.js          # Enemy entity with flash-on-hit
│   │   ├── InvaderGrid.js      # 5×11 formation logic
│   │   ├── Bullet.js           # Player & enemy projectiles
│   │   ├── Barrier.js          # Destructible shields
│   │   ├── Collision.js        # AABB hit detection
│   │   ├── PowerUp.js          # Drops & timed effects
│   │   └── Score.js            # Combos, high scores, wave tracking
│   ├── graphics/
│   │   ├── Renderer.js         # WebGPU/WebGL init + screen shake
│   │   ├── ShaderLib.js        # Custom GLSL (glow, dissolve, shield)
│   │   ├── ParticleSystem.js   # GPU instanced particles
│   │   ├── PostFX.js           # Bloom → CRT → ChromAb → Vignette
│   │   ├── Background.js       # 3-layer parallax starfield + nebula
│   │   └── Models.js           # Procedural geometry factory
│   ├── audio/
│   │   └── AudioManager.js     # Oscillator-based retro SFX
│   ├── ui/
│   │   ├── HUD.js              # Score/lives/wave overlay
│   │   ├── Menu.js             # Title, game over, pause screens
│   │   └── styles.css          # Neon glow animations
│   └── utils/
│       ├── Config.js           # All game constants
│       ├── Input.js            # Keyboard handler
│       └── Pool.js             # Object pooling for bullets
└── docs/
    ├── build-report.html       # Interactive metrics dashboard
    └── metrics.md              # Raw agent performance data
```

---

## 👥 Contributors

<table>
  <tr>
    <td align="center"><strong><a href="https://github.com/claudlos">claudlos</a></strong><br/>Project creator<br/>& human overseer</td>
    <td align="center"><strong>Hermes</strong><br/><a href="https://github.com/NousResearch/hermes-agent">Hermes Agent</a><br/>Orchestrator & planner</td>
    <td align="center"><strong>Claude Code</strong><br/><a href="https://claude.ai">Anthropic</a><br/>Lead developer</td>
    <td align="center"><strong>Codex CLI</strong><br/><a href="https://openai.com">OpenAI</a><br/>Implementation & QA</td>
    <td align="center"><strong>Nemotron</strong><br/><a href="https://nvidia.com">NVIDIA</a><br/>Local scaffolding</td>
  </tr>
</table>

---

## 🛠️ Built With

- **[smux](https://github.com/ShawnPana/smux)** — Multi-agent tmux workspace with cross-pane communication
- **[TurboQuant](https://github.com/spiritbuun/llama-cpp-turboquant-cuda)** — turbo3 KV cache compression enabling 64K context on a 4GB GPU
- **[Claude Code](https://claude.ai/code)** — Anthropic's CLI agent (MAX subscription)
- **[Codex CLI](https://github.com/openai/codex)** — OpenAI's coding agent (ChatGPT Plus)
- **[Hermes](https://github.com/NousResearch/hermes-agent)** — AI agent framework with tool-calling and multi-session orchestration

## 📄 License

MIT
