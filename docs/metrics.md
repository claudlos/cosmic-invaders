# Cosmic Invaders — Multi-Agent Build Metrics

## Agent Configuration

| Agent | Model | Provider | Speed | Context | Cost |
|-------|-------|----------|-------|---------|------|
| nemo-1 | Nemotron 3-Nano 4B (Q4_K_M) | TurboQuant local (turbo3 KV, ngl=99) | ~51 t/s | 64K | $0 |
| claude-1 | Claude Opus 4.6 | Anthropic MAX subscription | — | 1M | $0 (sub) |
| codex-1 | GPT-5.4 | ChatGPT Plus subscription | — | — | $0 (sub) |
| hermes | Claude Opus 4.6 | Anthropic API (orchestrator) | — | 1M | API cost |

## Hardware
- GPU: NVIDIA RTX 3050 Ti Laptop (4GB VRAM) — running Nemotron server
- CPU: Intel i7 (16 threads)
- RAM: 16GB DDR4
- Nemotron VRAM: 3305 MiB / 4096 MiB

## Task Log

| # | Phase | Task | Agent | Duration | Tools | Errors | Status | Notes |
|---|-------|------|-------|----------|-------|--------|--------|-------|
| 1.1 | Scaffolding | package.json + vite + index.html + dirs | nemo-1 | ~90s | 1 | 0 | ✅ | Three.js version old, fixed by Claude |
| 1.2 | Scaffolding | Config.js (game constants) | nemo-1 | ~60s | 1 | 0 | ✅ | Clean, all values correct |
| 1.3 | Scaffolding | Input.js (keyboard handler) | nemo-1 | ~60s | 0 | 0 | ✅ | Had `this` binding bug, fixed by Claude |
| 2.1-2.4 | Core Engine | Renderer + Game + Player + main.js | claude-1 | 95s | ~15 | 0 | ✅ | Also fixed nemo's bugs in Input.js, vite.config, package.json |
| 3.1-3.4 | Gameplay | Invader + Grid + Bullet + Collision + Barrier + PowerUp | codex-1 | ~85s | ~12 | 0 | ✅ | Also fixed WebGPU import path, verified build |
| 3.5 | Gameplay | Score.js (scoring system) | nemo-1 | ~60s | 1 | 0 | ✅ | Clean implementation |
| 4.1-4.5 | Graphics | ShaderLib + Particles + PostFX + Background + Models | claude-1 | 158s | ~20 | 0 | ✅ | WGSL shaders, instanced particles, procedural geometry |

## Summary Statistics

### Per-Agent Totals
| Agent | Tasks | Total Time | Avg Time | Files Created | Lines Written | Fix Others' Bugs |
|-------|-------|------------|----------|---------------|---------------|-----------------|
| nemo-1 | 4 | ~4.5 min | ~68s | 5 | ~210 | 0 |
| claude-1 | 2 (batched) | ~4.2 min | ~127s | 9 | ~1300 | 3 (Input.js, vite, package.json) |
| codex-1 | 1 (batched) | ~1.4 min | ~85s | 6 | ~510 | 1 (Renderer.js import) |

### Phase Totals
| Phase | Tasks | Wall Time | Agent | Lines |
|-------|-------|-----------|-------|-------|
| 1. Scaffolding | 3 | ~3.5 min | nemo-1 | ~92 |
| 2. Core Engine | 4 (batched) | ~1.6 min | claude-1 | ~320 |
| 3. Gameplay | 7 (batched) | ~2.4 min | codex-1 + nemo-1 | ~690 |
| 4. Graphics | 5 (batched) | ~2.6 min | claude-1 | ~920 |

### Codebase Stats
- **Total files**: 18 JavaScript modules
- **Total lines**: 2,024 LOC
- **Build status**: ✅ Passing (Vite, chunk-size warning only)
- **Architecture**: ES modules, Three.js + WebGPU
- **Total wall time**: ~12 minutes (Phases 1-4)

### Key Observations

1. **Nemotron (nemo-1) at $0 cost**: Good for boilerplate — Config.js, Score.js came out clean. Input.js had a `this` binding bug (common pattern issue for small models). ~60-90s per task including chain-of-thought reasoning time.

2. **Claude Code (claude-1) as lead developer**: Produced the most complex code (shaders, particles, renderer). Proactively fixed bugs in other agents' code. 1m35s for 4 files, 2m38s for 5 graphics files. The quality ceiling is clearly higher.

3. **Codex (codex-1) as implementation + QA**: Fast bulk implementation (6 gameplay files in ~85s). Went beyond the task to fix a build-breaking import in Renderer.js. Ran build verification autonomously. Needed manual approval for sandbox-escaping commands (5 approvals).

4. **Codex approval friction**: The `--full-auto` mode still prompts for sandbox escape and npm commands. Each approval cost ~15s of orchestrator time. Would benefit from `--dangerously-bypass-approvals-and-sandbox` for trusted projects.

5. **Prompt injection risk**: Codex had a shell quoting issue with parentheses in the prompt (bash syntax error). Fixed by writing tasks to .md files and having agents read them. Claude handled the same prompt fine.

6. **Agent complementarity**: nemo-1 for cheap scaffolding → claude-1 for complex architecture → codex-1 for bulk implementation + build verification. The token-saving strategy works — nemo handled 4 tasks at zero cost that would have consumed MAX/Plus tokens.

### Context Usage
| Agent | Start | End | Delta | % Used |
|-------|-------|-----|-------|--------|
| nemo-1 | 18.1K | 21.1K | +3K | 32% of 64K |
| claude-1 | 0 | ~40K est | ~40K | ~4% of 1M |
| codex-1 | 0 | ~7% used | — | 93% remaining |

### Error Log
| Time | Agent | Error | Resolution |
|------|-------|-------|------------|
| Phase 1 | nemo-1 | Input.js `this` binding bug | Fixed by claude-1 in Phase 2 |
| Phase 1 | nemo-1 | Three.js version ^0.14.0 (outdated) | Fixed by claude-1 to latest |
| Phase 1 | nemo-1 | vite.config.js used CommonJS | Fixed by claude-1 to ESM |
| Phase 3 | codex-1 | Shell quoting broke prompt | Fixed by using .task-codex.md file |
| Phase 3 | codex-1 | WebGPU import path wrong | Self-fixed by codex-1 during build check |
