# AGENTS.md

This file contains high-signal, repo-specific guidance for local coding agents working in this repository. 

## Development Setup

- Run `npm install` to install local development dependencies
- Use `npm run dev` to start the local Vite development server
- Open the provided local URL (usually `http://localhost:3000`) in your browser to play/test the game

## Build

- Run `npm run build` to compile production-ready assets
- The build output is placed in the root `dist/` directory

## Code Quality

- Configuration parameters are located in `vite.config.js`
- Type checking is handled via TypeScript using `tsconfig.json`

## Project Structure & Entry Points

- **Primary Entry Point:** `index.html` at the project root maps the script loading sequence.
- **Source Code (`src/`):** All active game logic, canvas handlers, state managers, and game loops reside directly inside the `./src/` folder.
- **Static Assets (`public/`):** Images, audio files, texture packs, or maps are housed in the `./public/` directory.

## Critical Agent Constraints

- **CRITICAL:** Do NOT look for `src/app/`, `src/components/`, or Next.js API routing. This is a frontend web game powered by Vite, not a Next.js application.
- **CRITICAL:** Do NOT expect a backend database setup, `.env` file requirements, or `DATABASE_URL` strings unless explicitly instructed by the user later.
- Before suggesting feature upgrades, use your directory tools to list the scripts inside `./src/` to map the existing game loops.
