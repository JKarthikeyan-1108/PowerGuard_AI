# PowerGuard Testing Guide

This document outlines the testing strategy and commands for the PowerGuard platform.

## Test Suites

### 1. Backend Testing (Unit, API, Integration)
We use **Jest** and **Supertest** for testing the Node.js Express backend.

- **Directory**: `apps/server/src/tests/`
- **Run Tests**: 
  ```bash
  cd apps/server
  npm test
  ```
- **Run with Coverage**:
  ```bash
  npm run test:coverage
  ```

### 2. Frontend Component Testing
We use **Vitest** and **React Testing Library** for testing UI components.

- **Directory**: `apps/web/src/components/__tests__/`
- **Run Tests**: 
  ```bash
  cd apps/web
  npm test
  ```
- **Run with Coverage**:
  ```bash
  npm run test:coverage
  ```

### 3. Frontend End-to-End (E2E) Testing
We use **Playwright** for complete end-to-end browser testing.

- **Directory**: `apps/web/e2e/`
- **Run Tests**: 
  ```bash
  cd apps/web
  npm run test:e2e
  ```
- **View UI Trace**:
  ```bash
  npx playwright show-report
  ```

## Generating Coverage Reports
Running `npm run test:coverage` in both `apps/server` and `apps/web` will generate a `/coverage` folder containing an `index.html` report.

## CI/CD Testing
All tests are automatically run on the `main` branch via GitHub Actions (`.github/workflows/ci.yml`). Any pull request will be blocked if test coverage falls below the required threshold or if any test fails.
