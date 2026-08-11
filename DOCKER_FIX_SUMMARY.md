# Docker Build Fix for Render Deployment

## Problem
The Docker build was failing on Render with the following errors:
1. **Node version mismatch**: Puppeteer 25.6.0 requires Node >=22.12.0, but the Dockerfile used Node 18
2. **Missing unzip utility**: Puppeteer needs `unzip` to extract Chrome binaries
3. **Chrome download failure**: Puppeteer was trying to download Chrome during build, which failed

## Solution Applied

### Changes to `backend/Dockerfile`:

1. **Upgraded Node version**: Changed from `node:18-slim` to `node:22-slim`
2. **Added required dependencies**:
   - `chromium`: System-installed browser for Puppeteer
   - `unzip`: Required for extracting packages
3. **Added environment variables**:
   - `PUPPETEER_SKIP_DOWNLOAD=true`: Skip downloading Chrome during npm install
   - `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`: Use system Chromium

## Why This Works

- **Node 22** satisfies Puppeteer's engine requirements
- **System Chromium** is more reliable in Docker environments than downloading
- **PUPPETEER_SKIP_DOWNLOAD** prevents the download that was causing the build to fail
- **unzip** utility allows npm packages to extract properly

## Next Steps for Render Deployment

1. Commit these changes:
   ```bash
   git add backend/Dockerfile
   git commit -m "fix: upgrade Node to 22 and fix Puppeteer dependencies for Docker"
   git push
   ```

2. Trigger a new build on Render (it should auto-deploy if connected to Git)

3. Monitor the build logs - it should now complete successfully

## Note About Puppeteer

Currently, Puppeteer is listed in `package.json` but the PDF generation uses PDFKit instead. If you don't need Puppeteer for any functionality, consider removing it to reduce image size and build time:

```bash
cd backend
npm uninstall puppeteer @types/puppeteer
```

However, keeping it installed (as the fix does) won't cause issues - it's now properly configured.
