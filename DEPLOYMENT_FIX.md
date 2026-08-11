# Deployment Fix - ES Module Resolution & Prisma OpenSSL

## Problem 1: ES Module Resolution (FIXED)

The backend application was failing to start on Render with the following error:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/app/dist/config/env' 
imported from /app/dist/index.js
```

### Root Cause

When using ES modules (`"type": "module"` in package.json), Node.js requires **explicit file extensions** (`.js`) in import statements. 

The TypeScript configuration was using `"moduleResolution": "bundler"`, which is designed for bundlers (Webpack, Vite, Bun) that automatically resolve extensions. However, Node.js doesn't do this - it requires the `.js` extension to be explicitly present.

### Solution

#### 1. Updated TypeScript Configuration

Changed `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "Node16",           // Changed from "ESNext"
    "moduleResolution": "Node16", // Changed from "bundler"
    // ... rest of config
  }
}
```

#### 2. Added .js Extensions to All Imports

Updated all relative imports throughout the codebase to include `.js` extensions:

**Before:**
```typescript
import { env } from './config/env';
import { authService } from '../services/authService';
```

**After:**
```typescript
import { env } from './config/env.js';
import { authService } from '../services/authService.js';
```

---

## Problem 2: Prisma OpenSSL Compatibility (FIXED)

After fixing the ES module issue, a new error appeared:

```
Error loading shared library libssl.so.1.1: No such file or directory
PrismaClientInitializationError: Unable to require `/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node`
```

### Root Cause

Alpine Linux 3.21 (used in `node:18-alpine`) ships with OpenSSL 3.x, but the Prisma binary was compiled against OpenSSL 1.1.x. The Prisma engine couldn't find the required `libssl.so.1.1` shared library.

### Solution

#### 1. Install OpenSSL 1.1 Compatibility Package

Updated `backend/Dockerfile` to include the OpenSSL 1.1 compatibility library:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install system dependencies including OpenSSL 1.1 for Prisma
RUN apk add --no-cache python3 make g++ openssl1.1-compat
```

#### 2. Configure Prisma Binary Targets

Updated `backend/prisma/schema.prisma` to explicitly generate the correct binary for Alpine Linux:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl"]
}
```

The `linux-musl` target is specifically for Alpine Linux, which uses the musl C library instead of glibc.

---

## Files Modified

### First Fix (ES Modules)
- `backend/tsconfig.json` - Module resolution configuration
- `backend/src/index.ts` - Entry point imports
- All route files (`backend/src/routes/*.ts`) - 7 files
- All service files (`backend/src/services/*.ts`) - 7 files
- All middleware files (`backend/src/middleware/*.ts`) - 3 files
- `backend/src/seed.ts` - Seed script imports

### Second Fix (Prisma OpenSSL)
- `backend/Dockerfile` - Added OpenSSL 1.1 compatibility package
- `backend/prisma/schema.prisma` - Added binary targets for Alpine Linux

---

## Why This Works

### ES Module Fix
1. **TypeScript Compilation**: TypeScript now compiles with Node16 module resolution, which understands that `.js` extensions in TypeScript imports refer to `.js` files in the output
2. **Node.js Runtime**: Node.js can now find the modules because they have explicit `.js` extensions
3. **Development**: Works with Bun (which handles this automatically) and Node.js in production

### Prisma Fix
1. **OpenSSL Compatibility**: The `openssl1.1-compat` package provides the `libssl.so.1.1` library that Prisma requires
2. **Correct Binary**: The `linux-musl` binary target ensures Prisma generates the engine compatible with Alpine Linux
3. **Build-time Generation**: The correct binary is generated during the Docker build process

---

## Verification

Build the project locally to verify:

```bash
cd backend

# Verify TypeScript compilation
npm run build

# Check compiled output has .js extensions
head dist/index.js
# Should show: import { env } from './config/env.js';

# Verify Prisma generates correct binary
npm run prisma:generate
# Should generate linux-musl binary in addition to native
```

---

## Deployment

The changes have been committed and pushed to GitHub. Render will automatically:

1. Clone the updated code
2. Build the Docker image with OpenSSL 1.1 compatibility
3. Run `npm install`
4. Run `prisma generate` (generates linux-musl binary)
5. Run `npm run build` (compiles TypeScript with .js extensions)
6. Start the server with `node dist/index.js`

The application should now start successfully without module resolution or OpenSSL errors.

---

## Key Takeaways

### ES Modules
- ES modules in Node.js require explicit file extensions
- Use `"moduleResolution": "Node16"` when targeting Node.js
- Use `"moduleResolution": "bundler"` only when using a bundler
- TypeScript's `.ts` imports should use `.js` extensions when compiling to ES modules

### Prisma on Alpine Linux
- Alpine Linux uses musl libc, not glibc
- Prisma requires OpenSSL 1.1.x, but Alpine 3.21+ ships with OpenSSL 3.x
- Install `openssl1.1-compat` package for backward compatibility
- Use `binaryTargets = ["native", "linux-musl"]` in schema.prisma for Alpine Linux deployments
