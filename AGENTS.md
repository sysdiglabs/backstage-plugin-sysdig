# Repository Guidelines

## Project Purpose & Structure
This repository contains the **Sysdig Plugin for Backstage**, a frontend plugin that integrates Sysdig Secure vulnerability and posture reports into the Backstage service catalog.

**Key Directories:**
- **`src/`**: Source code root.
  - **`api/`**: `SysdigApiClient` implementation using `fetchApi`.
  - **`components/`**: React components.
    - `SysdigComponent`: Main dashboard.
    - `Sysdig*FetchComponent`: Individual data widgets (Runtime, Registry, Pipeline, Posture).
  - **`lib/`**: Helpers, constants, and annotation definitions (`annotations.ts`).
- **`dev/`**: Local development harness using `createDevApp` and mock data.
- **`img/`**: Assets for documentation.

**Tech Stack:** React, TypeScript, Backstage Plugin API, Material UI.
**Package Manager:** Yarn.

## Build, Test, & Development
- **`yarn install`**: Install dependencies.
- **`yarn start`**: Starts the local development server at `http://localhost:3000`. Uses `dev/index.tsx` for context. If address is still in use use `fuser -k 3000/tcp`.
- **`yarn test`**: Runs unit tests using Jest. Use `yarn test --watchAll=false` to run tests once without watch mode.
- **`yarn lint`**: Runs ESLint to check code quality.
- **`yarn build`**: Builds the plugin for distribution.
- **`just bump`**: Updates dependencies (requires Nix/Just).

## Onboarding & Known Issues
**Crucial setup details for new contributors:**
1. **Package Manager**: Strictly use **Yarn**. This repo may contain a misleading `package-lock.json`; ignore it.
2. **Dev Dependencies**: If `yarn start` fails, ensure `react`, `react-dom`, and `react-router-dom` (v6) are explicitly in `devDependencies`.
3. **Configuration**: `app-config.yaml` is not committed but required for `yarn start`. Create it with standard proxy settings if missing.
4. **Entity Context**: The plugin crashes if run in isolation because it uses `useEntity`. The `dev/index.tsx` **must** wrap `SysdigPage` in an `<EntityProvider>` with a valid mock entity object.
5. **Data & Auth**: Without `SYSDIG_SECURE_TOKEN`, requests fail. For UI work, override `sysdigApiRef` with a **Mock Client** in `dev/index.tsx` (see `dev/MockSysdigClient.ts`).

## Coding Style & Naming
- **Language**: TypeScript (`.ts`, `.tsx`). Strict mode enabled.
- **Components**: Functional components with Hooks (`useEntity`, `useAsync`, `useApi`).
- **Styling**: Use Material UI (`@material-ui/core`) and Backstage core components (`@backstage/core-components`).
- **Naming**: PascalCase for components (`SysdigComponent`), camelCase for functions/vars.
- **Imports**: Prefer relative imports within `src/` but use strict package imports for external deps.

## Testing Guidelines
- **Framework**: Jest + React Testing Library + MSW (Mock Service Worker).
- **Location**: Tests are co-located with source files (e.g., `SysdigComponent.test.tsx`).
- **Requirement**: Components must be tested for rendering and error states. Use `setupRequestMockHandlers` for API mocking.

## Commit & PR Guidelines
- **Commits**: Follow **Conventional Commits** format:
  - `feat(scope): description`
  - `fix(scope): description`
  - `chore: description`
- **Pull Requests**:
  - Title must match the commit format.
  - Include screenshots for UI changes.
  - Ensure `yarn test` and `yarn lint` pass before requesting review.

## Release Process
The release process is semi-automated:
1.  **Manual Version Bump**: Before creating a release, the `version` field in `package.json` must be manually updated (e.g., from `1.3.2` to `1.3.3`).
2.  **Automated Release**: Once the version is manually updated and pushed to the `main` branch, the GitHub Actions workflow (`.github/workflows/release.yaml`) automatically:
    *   Creates a new GitHub Release with the updated version.
    *   Publishes the package to NPM.

## Documentation Maintenance
- Keep `README.md` updated with new annotations or configuration options.
- Maintain this `AGENTS.md` to reflect architectural changes.
- **Agent Note**: If `src/lib/annotations.ts` changes, update the "How to annotate services" section in `README.md`.
