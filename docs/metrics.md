# Cosmic Invaders — Final Multi-Agent Build Metrics

## Agent Configuration

| Agent | Model | Provider | Decode Speed | Context | Cost |
|-------|-------|----------|-------------|---------|------|
| nemo-1 | Nemotron 3-Nano 4B (Q4_K_M) | TurboQuant local (turbo3 KV, ngl=99) | ~51 t/s | 64K | $0 |
| claude-1 | Claude Opus 4.6 | Anthropic MAX subscription | — | 1M | $0 (sub) |
| codex-1 | GPT-5.4 | ChatGPT Plus subscription | — | — | $0 (sub) |
| hermes | Claude Opus 4.6 | Anthropic API (orchestrator) | — | 1M | API |

## Hardware
- GPU: NVIDIA RTX 3050 Ti Laptop (4GB VRAM, 3305 MiB used by Nemotron)
- CPU: Intel i7 (16 threads)
- RAM: 16GB DDR4

---

## Task Log

| # | Phase | Task | Agent | Duration | Status | Notes |
|---|-------|------|-------|----------|--------|-------|
| 1.1 | Scaffolding | package.json, vite, index.html, dirs | nemo-1 | ~90s | ✅ | Three version old |
| 1.2 | Scaffolding | Config.js (game constants) | nemo-1 | ~60s | ✅ | Clean |
| 1.3 | Scaffolding | Input.js (keyboard handler) | nemo-1 | ~60s | ✅ | `this` binding bug |
| 2.1-2.4 | Core Engine | Renderer + Game + Player + main.js | claude-1 | 95s | ✅ | Fixed nemo's bugs too |
| 3.1-3.4 | Gameplay | 6 files: Invader, Grid, Bullet, Collision, Barrier, PowerUp | codex-1 | ~85s | ✅ | Fixed WebGPU import, verified build |
| 3.5 | Gameplay | Score.js | nemo-1 | ~60s | ✅ | Clean |
| 4.1-4.5 | Graphics | ShaderLib, Particles, PostFX, Background, Models | claude-1 | 158s | ✅ | WGSL shaders, instanced particles |
| 5.1-5.4 | Audio & UI | AudioManager, HUD, Menu, styles.css | nemo-1 | FAIL | ❌ | Hallucinated tool calls, didn't create files |
| 5.1-5.4 | Audio & UI (retry) | AudioManager, HUD, Menu, styles.css | claude-1 | ~120s | ✅ | Created all 4 files |
| 6.1-6.2 | Integration | main.js + Game.js full wiring | codex-1 | ~132s | ✅ | Wired all modules, npm build passes |
| 6.3 | Polish | Models meshes, Pool.js, screen shake, flash | claude-1 | ~260s | ✅ | Replaced placeholder geometry, added Pool |
| 7.1 | Code Review | Full codebase review | codex-1 | ~120s | ✅ | Found 7 real issues (2 High, 3 Med, 2 Low) |

---

## Per-Agent Summary

| Agent | Tasks Attempted | Succeeded | Failed | Total Time | Lines Written | Cost |
|-------|----------------|-----------|--------|------------|---------------|------|
| nemo-1 | 5 | 4 | 1 | ~5.5 min | ~280 | $0 |
| claude-1 | 3 batches | 3 | 0 | ~10.5 min | ~1800 | $0 (MAX sub) |
| codex-1 | 3 batches | 3 | 0 | ~5.6 min | ~800 | $0 (Plus sub) |
| **TOTAL** | **11** | **10** | **1** | **~22 min** | **2875** | **$0** |

## Codebase Final Stats
- **Files**: 22 JavaScript + 1 CSS = 23 source files
- **Lines of code**: 2,875 (2,682 JS + 193 CSS)
- **Build status**: ✅ Passing
- **Architecture**: ES modules, Three.js + WebGPU/WebGL fallback
- **Commits**: 4

## Largest Files
| File | Lines | Author |
|------|-------|--------|
| Game.js | 361 | codex-1 + claude-1 |
| Models.js | 243 | claude-1 |
| ShaderLib.js | 230 | claude-1 |
| ParticleSystem.js | 212 | claude-1 |
| styles.css | 193 | claude-1 |
| PostFX.js | 169 | claude-1 |
| Background.js | 165 | claude-1 |
| Player.js | 134 | claude-1 |
| Renderer.js | 133 | claude-1 |
| InvaderGrid.js | 123 | codex-1 |

---

## Code Review Findings (by codex-1)

| # | Severity | Issue | File |
|---|----------|-------|------|
| 1 | **HIGH** | Invader flash timer never advanced — non-lethal hits leave invaders permanently white | Invader.js:52 |
| 2 | **HIGH** | Duplicate Background + PostFX instances (Renderer creates its own, main.js creates another) | Renderer.js + main.js |
| 3 | MEDIUM | Player bullets survive wave transitions — can hit freshly spawned invaders | Game.js:266 |
| 4 | MEDIUM | renderer.update() never called — screen shake and renderer-managed animations are dead code | Game.js:54 |
| 5 | MEDIUM | Star size attribute never consumed by PointsMaterial — all stars render same size | Background.js |
| 6 | LOW | Unused _vec3 variable | ParticleSystem.js:4 |
| 7 | LOW | Leaked BoxGeometry on Barrier construction | Barrier.js:16 |

---

## Key Findings

### Agent Strengths
- **Nemotron (nemo-1)**: Fast for simple boilerplate (Config, Score). $0 cost. But failed on complex multi-file task — hallucinated tool call XML instead of executing tools. Best for single-file, well-specified tasks.
- **Claude Code (claude-1)**: Best code quality. Proactively fixes other agents' bugs. Handles complex shader/graphics code. 6m20s for Phase 5+6 combined (9 files). The workhorse.
- **Codex (codex-1)**: Excellent for bulk implementation + QA. Self-verifies with npm build. Great code reviewer — found 7 real bugs. Needs approval clicks in full-auto mode (friction).

### Workflow Observations
1. **Parallel dispatch works** — Claude and Codex worked simultaneously on Phase 4 and 3
2. **File conflicts** — Both agents modified some of the same files (Game.js, Player.js). Last writer wins. Need better coordination or file locking.
3. **Task file pattern** — Writing prompts to .md files and having agents read them avoids shell quoting issues (codex bash syntax error with parentheses)
4. **Nemotron failure mode** — On complex multi-file tasks, Nemotron hallucinated `</tool_call>` XML tags instead of invoking Hermes tools. Known issue with small reasoning models. Keep nemo tasks simple and single-file.
5. **Codex approval friction** — 5+ manual approval clicks per task despite --full-auto. Use --dangerously-bypass-approvals-and-sandbox for trusted projects.
6. **Total build time**: 22 minutes for a 2,875 LOC Three.js game with WebGPU shaders, particles, post-processing, audio, and UI — across 3 agents at $0 subscription cost.

### Recommended Agent Roles (for future projects)
| Role | Agent | Reasoning |
|------|-------|-----------|
| Scaffolding, config, simple modules | nemo-1 | Free, fast for boilerplate |
| Architecture, complex code, shaders | claude-1 | Highest quality, fixes others' work |
| Bulk implementation, integration, QA | codex-1 | Fast, self-verifies, good reviewer |
| Orchestration, planning, metrics | hermes (gateway) | Coordinates all agents via tmux-bridge |
