# Publishing @mbrughelli/nestjs-typed-config to npm

A comprehensive guide for getting this package production-ready and published to the npm registry, based on [Snyk's best practices for creating a modern npm package](https://snyk.io/blog/best-practices-create-modern-npm-package/) and an audit of the current codebase.

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Fix package.json Metadata](#2-fix-packagejson-metadata)
3. [Initialize Git Repository](#3-initialize-git-repository)
4. [Remove Redundant .npmignore](#4-remove-redundant-npmignore)
5. [Add ESLint and Prettier Config Files](#5-add-eslint-and-prettier-config-files)
6. [Switch prepublishOnly to prepack](#6-switch-prepublishonly-to-prepack)
7. [Write Unit Tests](#7-write-unit-tests)
8. [Verify Package Contents with npm pack](#8-verify-package-contents-with-npm-pack)
9. [Test the Package Locally Before Publishing](#9-test-the-package-locally-before-publishing)
10. [Add GitHub Actions CI/CD](#10-add-github-actions-cicd)
11. [Set Up Automated Versioning with semantic-release](#11-set-up-automated-versioning-with-semantic-release)
12. [npm Account Setup and Security](#12-npm-account-setup-and-security)
13. [First Publish](#13-first-publish)
14. [Post-Publish Checklist](#14-post-publish-checklist)

---

## 1. Current State Assessment

### What's already in good shape

| Area | Status | Details |
|------|--------|---------|
| Dual CJS/ESM build | Done | tsup outputs both `.js` (CJS) and `.mjs` (ESM) |
| `exports` map | Done | Conditional exports for `.` and `./testing` with `import`, `require`, and `types` |
| `files` field | Done | Limits published contents to `dist`, `templates`, `README.md`, `LICENSE` |
| TypeScript declarations | Done | `.d.ts` and `.d.mts` generated with source maps |
| Peer dependencies | Done | `@nestjs/common`, `@nestjs/config`, `reflect-metadata`, `typescript` |
| MIT License | Done | Present at root |
| Comprehensive README | Done | 400+ lines with examples, API reference, migration guides |
| tsup build config | Done | Separate entry points for main and testing bundles, externals configured |
| `engines` field | Done | `node >= 18.0.0` |
| Keywords | Done | Relevant search terms for npm discovery |

### What needs to be fixed or added

| Issue | Priority | Section |
|-------|----------|---------|
| Placeholder author and repository URL in package.json | **Must fix** | [Section 2](#2-fix-packagejson-metadata) |
| Missing `publishConfig.access` for scoped package | **Must fix** | [Section 2](#2-fix-packagejson-metadata) |
| No git repository initialized | **Must fix** | [Section 3](#3-initialize-git-repository) |
| `.npmignore` is redundant with `files` field | Should fix | [Section 4](#4-remove-redundant-npmignore) |
| ESLint/Prettier deps installed but no config files | Should fix | [Section 5](#5-add-eslint-and-prettier-config-files) |
| `prepublishOnly` should be `prepack` | Should fix | [Section 6](#6-switch-prepublishonly-to-prepack) |
| Zero test files (Jest configured but no tests written) | **Must fix** | [Section 7](#7-write-unit-tests) |
| Package contents not verified | **Must fix** | [Section 8](#8-verify-package-contents-with-npm-pack) |
| No CI/CD pipeline | Should add | [Section 10](#10-add-github-actions-cicd) |
| No automated versioning | Nice to have | [Section 11](#11-set-up-automated-versioning-with-semantic-release) |
| npm 2FA not configured | **Must do** | [Section 12](#12-npm-account-setup-and-security) |
| Placeholder `@author` in `src/index.ts` header comment | Should fix | Update when fixing package.json |

---

## 2. Fix package.json Metadata

### Problem

Several fields still contain placeholder values:

```json
"author": "Your Name <your.email@example.com>",
"repository": {
  "type": "git",
  "url": "https://github.com/your-username/nestjs-typed-config.git"
}
```

Additionally, scoped packages (`@mbrughelli/nestjs-typed-config`) default to **private** on npm. Without `publishConfig`, running `npm publish` will fail with a 402 error unless you pass `--access=public` every time.

### Fix

Update `package.json` with your real information:

```json
{
  "author": "Michael Brughelli <your-real-email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_GITHUB_USERNAME/nestjs-typed-config.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_GITHUB_USERNAME/nestjs-typed-config/issues"
  },
  "homepage": "https://github.com/YOUR_GITHUB_USERNAME/nestjs-typed-config#readme",
  "publishConfig": {
    "access": "public"
  }
}
```

Also update the header comment in `src/index.ts`:

```typescript
/**
 * @mbrughelli/nestjs-typed-config
 *
 * Type-safe configuration module for NestJS applications with Zod validation
 *
 * @author Michael Brughelli
 * @license MIT
 */
```

And update the copyright line in `LICENSE`:

```
Copyright (c) 2024 Michael Brughelli
```

### Why this matters

- **`author`**: Shows up on the npm package page. Establishes you as the maintainer.
- **`repository`/`bugs`/`homepage`**: npm generates links on your package page. Without them, users can't find your source code, report bugs, or read docs.
- **`publishConfig.access`**: Scoped packages are private by default. This ensures `npm publish` works without needing `--access=public` every time and is required for `semantic-release` automation.

---

## 3. Initialize Git Repository

### Problem

This project directory is not a git repository. You need one before you can:
- Push to GitHub
- Use `semantic-release`
- Set up CI/CD
- Track changes properly

### Steps

```bash
cd /home/michaelbrughelli/repos/nestjs-typed-config

# Initialize
git init
git branch -M main

# Stage everything
git add .

# Create initial commit
git commit -m "feat: initial commit of @mbrughelli/nestjs-typed-config"

# Create the GitHub repo (requires gh CLI)
gh repo create nestjs-typed-config --public --source=. --remote=origin

# Push
git push -u origin main
```

If you prefer to create the repo through the GitHub web UI:

```bash
git remote add origin https://github.com/YOUR_USERNAME/nestjs-typed-config.git
git push -u origin main
```

### Commit message convention

If you plan to use `semantic-release` (Section 11), start using **conventional commits** now:

| Prefix | Meaning | Version bump |
|--------|---------|-------------|
| `feat:` | New feature | Minor (1.x.0) |
| `fix:` | Bug fix | Patch (1.0.x) |
| `BREAKING CHANGE:` | Breaking API change | Major (x.0.0) |
| `docs:` | Documentation only | No release |
| `chore:` | Maintenance | No release |
| `refactor:` | Code change, no behavior change | No release |
| `test:` | Adding/fixing tests | No release |

---

## 4. Remove Redundant .npmignore

### Problem

The project has both a `files` field in `package.json` and a `.npmignore` file. These two mechanisms serve the same purpose (controlling what gets published), and having both creates confusion and potential conflicts.

**Current `files` field** (allowlist approach — only these are included):
```json
"files": ["dist", "templates", "README.md", "LICENSE"]
```

**Current `.npmignore`** (blocklist approach — 55 lines of exclusions):
```
src/
*.ts
!*.d.ts
tsconfig.json
tsup.config.ts
...etc
```

### Why `files` is better

The `files` field uses an **allowlist** pattern — only what's explicitly listed gets published. This is safer and easier to maintain than a blocklist where you must remember to exclude every new file or directory you add.

The Snyk guide recommends using `files` and avoiding `.npmignore` for this reason.

### Fix

Delete `.npmignore`:

```bash
rm .npmignore
```

The `files` field already covers everything correctly. npm will always include `package.json`, `README.md`, `LICENSE`, and `CHANGELOG.md` regardless of the `files` field.

### Verify afterward

Run `npm pack --dry-run` (Section 8) to confirm only the intended files are included.

---

## 5. Add ESLint and Prettier Config Files

### Problem

The `devDependencies` include ESLint and Prettier packages, and `package.json` has lint scripts, but there are no configuration files. Running `npm run lint` will use default ESLint behavior, which likely won't match the project's TypeScript setup.

### Fix

Create `.eslintrc.json`:

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "env": {
    "node": true,
    "jest": true
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
  "ignorePatterns": ["dist/", "node_modules/", "examples/", "templates/"]
}
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Note on devDependency versions

The current ESLint ecosystem versions (`eslint@^8`, `@typescript-eslint/*@^6`) are older but compatible with each other. If you want to upgrade to ESLint 9 + flat config later, that's a separate effort. The config above works with the currently installed versions.

---

## 6. Switch prepublishOnly to prepack

### Problem

The current script:

```json
"prepublishOnly": "npm run build && npm run test"
```

The Snyk guide recommends using `prepack` instead.

### Why `prepack` is better

| Hook | When it runs |
|------|-------------|
| `prepublishOnly` | Only before `npm publish` |
| `prepack` | Before `npm publish` **and** before `npm pack` |

Since `npm pack` is how you test your package locally before publishing (Section 9), using `prepack` ensures the build is always fresh for both testing and publishing.

### Fix

Update `package.json` scripts:

```json
{
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "typecheck": "tsc --noEmit",
    "prepack": "npm run build && npm run test",
    "release": "np"
  }
}
```

---

## 7. Write Unit Tests

### Problem

Jest is fully configured in `package.json`, but there are **zero test files** in the project. The `prepack` script runs `npm run test`, which will fail with no tests. More importantly, shipping an untested library is risky — consumers depend on your code working correctly.

### What to test

The library has four main areas that need test coverage:

#### 7.1 `createValidationFunction` (base-config.module.ts)

This is pure logic that can be tested without NestJS:

```typescript
// src/__tests__/create-validation-function.spec.ts
import { z } from 'zod';
import { createValidationFunction } from '../base-config.module';

describe('createValidationFunction', () => {
  const schema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
  });

  const validate = createValidationFunction(schema);

  it('should return parsed values for valid config', () => {
    const result = validate({
      NODE_ENV: 'development',
      PORT: '8080',
      DATABASE_URL: 'postgresql://localhost:5432/db',
    });

    expect(result).toEqual({
      NODE_ENV: 'development',
      PORT: 8080,
      DATABASE_URL: 'postgresql://localhost:5432/db',
    });
  });

  it('should apply default values', () => {
    const result = validate({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://localhost:5432/db',
    });

    expect(result.PORT).toBe(3000);
  });

  it('should throw descriptive error for invalid config', () => {
    expect(() => validate({ NODE_ENV: 'invalid' })).toThrow(
      'Environment validation failed',
    );
  });

  it('should throw for missing required fields', () => {
    expect(() => validate({})).toThrow('Environment validation failed');
  });
});
```

#### 7.2 `createTypedConfigModule` (base-config.module.ts)

Test the module factory:

```typescript
// src/__tests__/create-typed-config-module.spec.ts
import { z } from 'zod';
import { createTypedConfigModule } from '../base-config.module';
import { BaseTypedConfigService } from '../base-config.service';
import { Injectable } from '@nestjs/common';

const testSchema = z.object({
  NODE_ENV: z.string().default('test'),
  PORT: z.coerce.number().default(3000),
});

@Injectable()
class TestConfigService extends BaseTypedConfigService<typeof testSchema> {
  protected readonly schema = testSchema;
  get port() { return this.get('PORT'); }
}

describe('createTypedConfigModule', () => {
  it('should return a DynamicModule with correct structure', () => {
    const module = createTypedConfigModule({
      schema: testSchema,
      serviceClass: TestConfigService,
    });

    expect(module).toHaveProperty('imports');
    expect(module).toHaveProperty('providers');
    expect(module).toHaveProperty('exports');
    expect(module.providers).toContain(TestConfigService);
    expect(module.exports).toContain(TestConfigService);
  });

  it('should be global by default', () => {
    const module = createTypedConfigModule({
      schema: testSchema,
      serviceClass: TestConfigService,
    });

    expect(module.global).toBe(true);
  });

  it('should respect isGlobal: false', () => {
    const module = createTypedConfigModule({
      schema: testSchema,
      serviceClass: TestConfigService,
      isGlobal: false,
    });

    expect(module.global).toBeFalsy();
  });
});
```

#### 7.3 Testing utilities (testing/config.mock.ts)

```typescript
// src/__tests__/config-mock.spec.ts
import { z } from 'zod';
import { createTypedConfigMock, MockTypedConfigService, createTestConfig } from '../testing/config.mock';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('test'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url().optional(),
});

describe('createTypedConfigMock', () => {
  it('should create a mock with schema defaults', () => {
    const mock = createTypedConfigMock(schema);
    expect(mock.getValue('NODE_ENV')).toBe('test');
    expect(mock.getValue('PORT')).toBe(3000);
  });

  it('should apply overrides', () => {
    const mock = createTypedConfigMock(schema, { PORT: 8080 });
    expect(mock.getValue('PORT')).toBe(8080);
  });

  it('should support updateValues', () => {
    const mock = createTypedConfigMock(schema);
    mock.updateValues({ PORT: 9090 });
    expect(mock.getValue('PORT')).toBe(9090);
  });
});

describe('MockTypedConfigService', () => {
  it('isTest() returns true when NODE_ENV is test', () => {
    const mock = createTypedConfigMock(schema, { NODE_ENV: 'test' });
    expect(mock.isTest()).toBe(true);
    expect(mock.isProduction()).toBe(false);
    expect(mock.isDevelopment()).toBe(false);
  });

  it('isProduction() returns true when NODE_ENV is production', () => {
    const mock = createTypedConfigMock(schema, { NODE_ENV: 'production' });
    expect(mock.isProduction()).toBe(true);
  });

  it('isDevelopment() returns true for development', () => {
    const mock = createTypedConfigMock(schema, { NODE_ENV: 'development' });
    expect(mock.isDevelopment()).toBe(true);
  });
});

describe('createTestConfig', () => {
  it('should return a config object with required fields', () => {
    const config = createTestConfig();
    expect(config).toHaveProperty('NODE_ENV', 'test');
    expect(config).toHaveProperty('PORT');
    expect(config).toHaveProperty('DATABASE_URL');
    expect(config).toHaveProperty('JWT_SECRET');
    expect(config).toHaveProperty('REDIS_URL');
  });
});
```

#### 7.4 `@ConfigProperty` decorator (decorators/config-property.decorator.ts)

```typescript
// src/__tests__/config-property.decorator.spec.ts
import 'reflect-metadata';
import { ConfigProperty, getConfigProperties } from '../decorators/config-property.decorator';

class TestService {
  @ConfigProperty({ description: 'The app port', required: true })
  get port() { return 3000; }

  @ConfigProperty({ description: 'Secret key', sensitive: true })
  get secret() { return 'shh'; }
}

describe('@ConfigProperty', () => {
  it('should store metadata on the class', () => {
    const properties = getConfigProperties(TestService);
    expect(properties).toHaveLength(2);
  });

  it('should store description and required flag', () => {
    const properties = getConfigProperties(TestService);
    const portProp = properties.find(p => p.key === 'port');
    expect(portProp?.description).toBe('The app port');
    expect(portProp?.required).toBe(true);
  });

  it('should store sensitive flag', () => {
    const properties = getConfigProperties(TestService);
    const secretProp = properties.find(p => p.key === 'secret');
    expect(secretProp?.sensitive).toBe(true);
  });
});
```

### Running tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run in watch mode during development
npm run test:watch
```

### Coverage goal

Aim for **>80% line coverage** on the core modules. The `collectCoverageFrom` config in `package.json` already excludes `index.ts` barrel files and `.d.ts` files.

---

## 8. Verify Package Contents with npm pack

### Why

Before publishing, you must verify that the package contains exactly what consumers need — and nothing they don't (source code, config files, secrets, etc.).

### Steps

```bash
# See what would be included without creating the tarball
npm pack --dry-run
```

**Expected output** should show only:

```
dist/index.js
dist/index.mjs
dist/index.d.ts
dist/index.d.mts
dist/index.js.map
dist/index.mjs.map
dist/testing/index.js
dist/testing/index.mjs
dist/testing/index.d.ts
dist/testing/index.d.mts
dist/testing/index.js.map
dist/testing/index.mjs.map
dist/environment.interface-*.d.ts
dist/environment.interface-*.d.mts
templates/env.validation.example.ts
templates/config.service.example.ts
templates/config.module.example.ts
README.md
LICENSE
package.json
```

### Red flags to watch for

- **Any `.env` files** — secrets leak
- **`src/` directory** — source code shouldn't be in the package (types are in `dist/`)
- **`node_modules/`** — should never appear
- **`tsconfig.json`, `tsup.config.ts`** — not needed by consumers
- **`.git/`** — should never appear

### Inspect the actual tarball

```bash
# Create the tarball
npm pack

# Inspect its contents
tar -tzf nestjs-typed-config-core-1.0.0.tgz

# Clean up
rm nestjs-typed-config-core-1.0.0.tgz
```

---

## 9. Test the Package Locally Before Publishing

Before publishing to npm, test that the package actually works when installed as a dependency. The Snyk guide recommends several methods:

### Method 1: npm pack (recommended)

This most closely simulates what consumers will experience:

```bash
# In your package directory
npm pack
# This creates nestjs-typed-config-core-1.0.0.tgz

# In a test NestJS project
npm install /path/to/nestjs-typed-config-core-1.0.0.tgz
```

Then try importing and using the library in the test project:

```typescript
import { BaseTypedConfigService, createTypedConfigModule, z } from '@mbrughelli/nestjs-typed-config';
import { createTypedConfigMock } from '@mbrughelli/nestjs-typed-config/testing';
```

Verify:
- Imports resolve correctly
- TypeScript IntelliSense works
- Types are correct
- The module integrates with NestJS properly

### Method 2: npm link

Faster iteration during development:

```bash
# In your package directory
npm link

# In your test project
npm link @mbrughelli/nestjs-typed-config
```

**Note:** `npm link` uses symlinks, which can behave differently than a real install (especially with peer dependencies). Always do a final test with `npm pack` before publishing.

### Method 3: Use the examples/ directory

Your project already has `examples/basic-usage/`. Make sure it works:

```bash
cd examples/basic-usage
npm install
npm run build
```

---

## 10. Add GitHub Actions CI/CD

### Test workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

**Why test on 18, 20, and 22:** Your `engines` field requires `>=18.0.0`. Testing across versions ensures compatibility for all supported consumers.

### Security scanning (optional but recommended)

Create `.github/workflows/snyk.yml`:

```yaml
name: Snyk Security Check
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

To use this:
1. Create a free account at [snyk.io](https://snyk.io)
2. Get your API token from account settings
3. Add it as `SNYK_TOKEN` in your GitHub repo's Settings > Secrets > Actions

---

## 11. Set Up Automated Versioning with semantic-release

This is optional for a first publish but highly recommended for ongoing maintenance. `semantic-release` automates version bumping, changelog generation, and npm publishing based on your commit messages.

### Install

```bash
npm install -D semantic-release
```

### Configure

Add to `package.json`:

```json
{
  "release": {
    "branches": ["main"]
  }
}
```

### Create the release workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release
on:
  workflow_run:
    workflows: ['Tests']
    branches: [main]
    types:
      - completed

permissions:
  contents: write
  issues: write
  pull-requests: write
  id-token: write

jobs:
  release:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'npm'

      - run: npm ci
      - run: npm audit signatures

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

### Set up tokens

1. **GITHUB_TOKEN**: Automatically provided by GitHub Actions (no setup needed)
2. **NPM_TOKEN**: Generate at npmjs.com > Access Tokens > Generate New Token > **Automation** type
   - Add as a secret in GitHub repo: Settings > Secrets and variables > Actions > New repository secret

### Remove `np` if using semantic-release

The `np` package (`"release": "np"` in scripts) does manual interactive releases. If you go with `semantic-release`, remove it:

```bash
npm uninstall np
```

And remove the `release` script from `package.json`, or change it to:

```json
"release": "semantic-release"
```

### How it works going forward

1. You merge a PR to `main` with conventional commit messages
2. Tests CI runs and passes
3. Release CI triggers automatically
4. `semantic-release` reads commit messages, determines version bump, publishes to npm, creates a GitHub release with changelog

---

## 12. npm Account Setup and Security

### Create your npm account

1. Go to [npmjs.com/signup](https://www.npmjs.com/signup)
2. Verify your email

### Enable two-factor authentication (2FA)

This is **critical** for package security. Compromised npm accounts have led to supply chain attacks affecting millions of downloads.

1. Go to npmjs.com > Account > **Enable 2FA**
2. Choose **"Authorization and Publishing"** (most secure)
3. Scan the QR code with your authenticator app

### Log in locally

```bash
npm login
```

This will prompt for username, password, and 2FA code. It stores an auth token in `~/.npmrc`.

### Organization setup (for scoped packages)

Your package uses the `@nestjs-typed-config` scope. You'll need to either:

- **Option A:** Create an npm organization named `nestjs-typed-config` at npmjs.com > Add Organization
- **Option B:** Use your personal scope instead (e.g., `@michaelbrughelli/nestjs-typed-config-core`)

Org names on npm are first-come, first-served. If `nestjs-typed-config` is taken, you'll need to pick a different scope.

---

## 13. First Publish

Once all the above steps are complete, here's the publish sequence:

### Pre-flight checklist

```bash
# 1. Make sure you're on main and up to date
git checkout main
git pull origin main

# 2. Make sure everything is clean
git status
# Should show "nothing to commit, working tree clean"

# 3. Run the full check suite
npm run typecheck
npm run lint
npm test
npm run build

# 4. Verify package contents
npm pack --dry-run

# 5. Check the package size is reasonable
npm pack
ls -lh *.tgz
# Should be well under 1MB for this library
rm *.tgz
```

### Publish

**If publishing manually (without semantic-release):**

```bash
npm publish
```

Since `publishConfig.access` is set to `"public"` in package.json, this will work for the scoped package. Without that setting, you'd need:

```bash
npm publish --access=public
```

**If using semantic-release:**

Just push/merge to `main` with a conventional commit like:

```
feat: initial release of @mbrughelli/nestjs-typed-config
```

The CI pipeline handles the rest.

### Verify the publish

```bash
# Check that the package is live
npm view @mbrughelli/nestjs-typed-config

# Try installing it in a fresh project
mkdir /tmp/test-install && cd /tmp/test-install
npm init -y
npm install @mbrughelli/nestjs-typed-config
```

---

## 14. Post-Publish Checklist

After your first successful publish:

- [ ] Verify the package page looks correct at `https://www.npmjs.com/package/@mbrughelli/nestjs-typed-config`
- [ ] Confirm README renders correctly on npm
- [ ] Confirm repository/homepage/bugs links work
- [ ] Test installing the published package in a real NestJS project
- [ ] Verify TypeScript types and IntelliSense work for consumers
- [ ] Verify both `import` (ESM) and `require` (CJS) work
- [ ] Verify `@mbrughelli/nestjs-typed-config/testing` subpath export works
- [ ] Set up Snyk monitoring by connecting your GitHub repo at snyk.io
- [ ] Add a status badge to your README:

```markdown
[![npm version](https://img.shields.io/npm/v/@mbrughelli/nestjs-typed-config.svg)](https://www.npmjs.com/package/@mbrughelli/nestjs-typed-config)
[![Tests](https://github.com/YOUR_USERNAME/nestjs-typed-config/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR_USERNAME/nestjs-typed-config/actions/workflows/test.yml)
```

---

## Quick Reference: Complete Execution Order

For the impatient, here's the minimal path to first publish:

```bash
# 1. Fix package.json (author, repo, publishConfig) — manual edit
# 2. Fix src/index.ts header and LICENSE — manual edit
# 3. Delete .npmignore
rm .npmignore

# 4. Switch prepublishOnly to prepack in package.json — manual edit

# 5. Add ESLint + Prettier configs — create files

# 6. Write tests
# (create test files as described in Section 7)

# 7. Verify everything works
npm run lint
npm run typecheck
npm test
npm run build
npm pack --dry-run

# 8. Init git and push
git init && git branch -M main
git add . && git commit -m "feat: initial commit"
gh repo create nestjs-typed-config --public --source=. --remote=origin
git push -u origin main

# 9. Set up npm account + 2FA (web browser)

# 10. Publish
npm login
npm publish

# 11. (Optional) Add GitHub Actions CI + semantic-release
```
