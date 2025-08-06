# web-2d-game

## Table of Contents
1. [Project Overview](#project-overview)  
2. [Features](#features)  
3. [Technology Stack](#technology-stack)  
4. [Repository Structure](#repository-structure)  
5. [Getting Started](#getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Installation & Development](#installation--development)  
   - [Running the Game](#running-the-game)  
6. [Scripts & Commands](#scripts--commands)  
7. [Testing](#testing)  
   - [Unit & Integration Tests](#unit--integration-tests)  
   - [End‑to‑End Tests](#end‑to‑end-tests)  
   - [Coverage Report](#coverage-report)  
8. [Architecture & Design](#architecture--design)  
   - [Core Modules](#core-modules)  
   - [Data Persistence](#data-persistence)  
9. [Asset Management](#asset-management)  
10. [Deployment](#deployment)  
11. [Contributing](#contributing)  
12. [Versioning & Release Process](#versioning--release-process)  
13. [License](#license)  

---

## Project Overview
**web-2d-game** is a lightweight, browser‑based 2‑D platformer built for quick access and smooth gameplay across desktop and mobile devices. The game offers an instant‑play experience: open the URL and start playing—no installation required. It features keyboard controls, a responsive touch UI, scoring persistence via `localStorage`, and a polished UI flow (start menu, pause, level completion, high‑score table).

> **Goal:** Deliver a polished core loop (move, jump, collect, score) within an MVP on top of modern web tech while keeping the codebase highly testable and maintainable.

---

## Features
| Category | Description |
|----------|------------|
| **Core Gameplay** | Player movement (left/right, jump), simple tile‑based levels, goal object, scoring system |
| **Controls** | Keyboard (`← → ↑ space`) + on‑screen touch joystick + buttons for mobile |
| **UI Screens** | Start menu, pause overlay, level‑complete screen, high‑score list |
| **Persistence** | High scores & settings stored in `localStorage` |
| **Graphics** | PixiJS sprite‑sheet animation, particles, simple background |
| **Audio** | Background music loop & SFX (Howler.js) |
| **Responsive Design** | CSS media queries, dynamic scaling for mobile devices |
| **Optional Future** | Social sharing (Web Share API), level editor, online leaderboard |

---

## Technology Stack
| Layer | Technology | Reason |
|-------|-----------|--------|
| **HTML / CSS** | HTML5, CSS3 (media queries) | Static layout, responsive UI |
| **JS** | ES2023 | Modern language features |
| **Rendering** | **PixiJS** | Fast WebGL/canvas 2‑D; provides sprite sheet handling |
| **Audio** | **Howler.js** | Simple API for music & SFX |
| **Bundler** | **Parcel** (v2) | Zero‑config builds, hot‑module reloading |
| **Testing** | **Jest** (unit + integration), **Playwright** (E2E) | Fast, reliable, no external services |
| **Persistence** | **localStorage** + Tiny wrapper | Offline‑first & simple |
| **CI/CD** | GitHub Actions (build, test, deploy) | Automated verification |
| **Deployment** | GitHub Pages / Netlify (static assets) | One‑click static hosting |

---

## Repository Structure
```
web-2d-game/
│
├─ src/                 # Source code
│   ├─ renderer.js     # PixiJS initialization & render loop
│   ├─ input.js        # Keyboard & touch UI handling
│   ├─ level.js        # JSON level parser & collision grid
│   ├─ ui.js           # DOM overlays (menus, HUD)
│   ├─ storage.js     # localStorage wrapper
│   ├─ game.js         # Core Game class (state machine)
│   └─ logger.js      # Runtime logger (level‑controlled)
│
├─ assets/             # Spritesheets, audio, fonts
│   ├─ sprites.png
│   ├─ sprites.json
│   └─ audio/
│       ├─ music.mp3
│       └─ sfx/
│
├─ test/               # Tests
│   ├─ unit/          # Jest unit tests
│   ├─ integration/ # Jest integration tests
│   └─ e2e/            # Playwright tests
│
├─ public/            # Static assets for production
│   └─ index.html
│
├─ .gitignore
├─ package.json
├─ parcel-config.js (optional)
└─ README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18+ recommended) – includes npm
- **Git** (for cloning the repo)
- Optional (for faster asset rebuilds): `npm i -g parcel` (Parcel is installed locally, but a global install enables `parcel` CLI shortcut)

### Installation & Development
```bash
# 1. Clone the repository
git clone https://github.com/yourusername/web-2d-game.git
cd web-2d-game

# 2. Install dependencies
npm install

# 3. Start the development server (hot‑reload)
npm run dev
```
The dev server runs on `http://localhost:1234` (default `parcel` port).  
Open the URL in Chrome/Firefox/Safari (desktop or mobile). Parcel automatically rebuilds and reloads on file changes.

### Running the Game
- **Desktop**: Arrow keys (`← → ↑`) to move, `space` for jump.  
- **Mobile**: On‑screen joystick (left) + jump button (right).  
- Press **Esc** or tap the pause button to pause/resume.  
- On level completion, the “Level Complete” screen shows the score; high scores are stored locally.

---

## Scripts & Commands
| Command | Purpose |
|--------|--------|
| `npm run dev` | Starts Parcel dev server with hot‑module reload |
| `npm run build` | Creates production‑ready `dist/` folder (minified, hashed filenames) |
| `npm test` | Runs all Jest tests (unit + integration) |
| `npm test -- --watch` | Run tests in watch mode (useful while developing) |
| `npm run test:e2e` | Run Playwright end‑to‑end tests (headless Chromium) |
| `npm run lint` | Runs ESLint (if configured) |
| `npm run coverage` | Generates coverage report (`coverage/` folder) |
| `npm run serve` | Serves `dist/` folder via a simple static server (`npx serve dist`) |

---

## Testing

### Unit & Integration Tests
- Located under `test/unit/` and `test/integration/`.
- Run via `npm test`.
- **Mocking Strategy**: Dependency injection for renderer/audio/storage; Jest spies replace `localStorage` and audio.  
- Pure functions (collision detection, score calculation, storage getters) have 100 % unit test coverage.

### End‑to‑End Tests
- Located under `test/e2e/`.
- Execute with `npm run test:e2e`.  
- Scenarios cover:  
  1. Load the game, start a level, complete it, verify high‑score display.  
  2. Pause → resume flow.  
  3. Touch UI path on simulated mobile viewport (via Playwright device emulation).  

### Coverage Report
- Run `npm run coverage` to generate an HTML coverage report under `coverage/`.  
- Aim: **≥ 80 %** overall coverage, with critical modules at 100 %.

---

## Architecture & Design

### Core Modules
| Module | Purpose |
|-------|--------|
| **renderer.js** | Initializes Pixi Application, manages main render loop using `requestAnimationFrame` |
| **input.js** | Handles keyboard & touch events, abstracts them into a unified `inputState` object |
| **level.js** | Loads JSON map, creates a collision grid, spawns player and goal |
| **ui.js** | DOM overlay management (menus, HUD), provides methods `showMenu()`, `showPause()`, `showScore()` |
| **storage.js** | Tiny wrapper around `localStorage` (get/set/delete), namespaced under `web2dGame` |
| **game.js** | **GameState** machine (`INIT`, `PLAYING`, `PAUSED`, `COMPLETED`), orchestrates other modules |
| **logger.js** | Configurable log level (`debug`, `info`, `warn`, `error`) – useful for dev & CI |

### Data Persistence
- All persistent data uses `localStorage` via the `storage` module.  
- Structure: `web2dGame = { highScores: [{name, score, date}], settings: {...} }`  
- Data is automatically persisted on `score` change and on game start/reload.

---

## Asset Management
- **Sprites & Atlas**: `assets/spritesheet.png` + `assets/sprites.json` (automatically loaded by `assetLoader` before the first game start).  
- **Audio**: `assets/audio/` contains `music.mp3` (looped) and `sfx` folder (jump, collect, goal).  
- **Loading Screen**: Displays a simple progress bar while all assets are pre‑loaded before the first frame.

---

## Deployment

### Production Build
```bash
npm run build
```
- Files are stored in `dist/` (minified JS + hashed filenames).  
- `dist/index.html` points to the bundled `main.[hash].js` and includes all assets via relative paths.

### Hosting
**GitHub Pages**: Set `gh-pages` branch to `dist/` or use the `gh-pages` npm script:  
```bash
npm run deploy # (if script defined)
```
**Netlify**: Connect repository; Netlify automatically runs `npm i && npm run build` and deploys `dist` as the publishing folder.

### Updates & Cache‑Busting
- Parcel adds content hash to bundle filenames, invalidating caches when assets change.  
- Future: add a Service Worker for additional offline support (outside current scope).

---

## Contributing
1. **Fork** the repository.  
2. Create a feature branch: `git checkout -b feature/your-feature`.  
3. Write tests **first**, then implement.  
4. Run `npm test` (ensure all tests pass) and ensure coverage.  
5. Commit with a clear message: `feat: add ...` (follow conventional commits).  
6. Push & open a **Pull Request**.  
7. PR will be automatically checked by CI (unit + integration + E2E).  

### Code Style
- **ESLint** (recommended) using `npm run lint`.  
- Use `camelCase` for variables and functions, `PascalCase` for classes.  
- Keep functions pure when possible; use pure functions for all business logic.

---

## Versioning & Release Process
- **Semantic versioning** (MAJOR.MINOR.PATCH).  
- Minor releases for new features; patch versions for bug‑fixes.  
- Tag releases on GitHub (`v1.0.0`).  
- CI builds and publishes to GitHub Pages automatically via the `github-pages` workflow after a tag is pushed.

---

## License
This project is licensed under the **MIT License**. See `LICENSE` for full text.

--- 

Enjoy the game! 🎮

**---**  

*Prepared by the AI Project Manager.*
