@AGENTS.md

## Claude-specific notes

- Nx cannot open unix sockets in a sandbox. Export `NX_DAEMON=false NX_ISOLATE_PLUGINS=false`
  and `nx` works normally; without the second one it dies with "Failed to start plugin worker".
  Jest also runs fine directly, with no daemon at all:
  `node node_modules/jest/bin/jest.js --config apps/<p>/jest.config.ts --rootDir apps/<p>`.
- `pnpm install` cannot complete in a sandbox: packages that ship a `.vscode/` or `.idea/`
  directory fail to extract with `ERR_PNPM_EPERM`. Ask the user to run installs themselves.
- Prefer `./node_modules/.bin/<tool>` over `npx`.
- Never read or echo `.env` / `.env.*`.

## Setup

Copy `.claude/settings.example.json` to `.claude/settings.json` to pick up the project
permission allowlist (read-only nx/jest/git commands pre-approved, `.env` denied).

The mobile release runbook lives in `docs/mobile-release.md`.
