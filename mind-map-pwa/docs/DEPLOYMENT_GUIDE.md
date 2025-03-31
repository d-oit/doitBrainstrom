# Deployment Guide - Mind Map PWA

**Project:** Mind Map PWA
**Phase:** Phase 10: Deployment and Maintenance (DEPLOY-011)
**Date:** May 2023
**Prepared by:** Mind Map PWA Team

## 1. Introduction
This document provides a step-by-step guide for deploying the Mind Map PWA application to a static hosting service.

## 2. Prerequisites
- Static hosting account (e.g., Netlify, Vercel, AWS S3)
- Node.js (v16 or later) and npm installed
- AWS S3 bucket or compatible storage service for data storage
- Domain name (optional - if setting up custom domain)

## 3. Deployment Steps

### 3.1 Prepare for Production
1. Update environment variables for production:
   - Create a `.env.production` file with production values:
   ```
   VITE_S3_ENDPOINT=your-production-s3-endpoint
   VITE_S3_ACCESS_KEY_ID=your-production-access-key
   VITE_S3_SECRET_ACCESS_KEY=your-production-secret-key
   VITE_S3_BUCKET_NAME=your-production-bucket-name
   ```

2. Test the application locally with production settings:
   ```bash
   npm run build
   npm run preview
   ```

3. Verify that all features work correctly with production settings.

### 3.2 Build the Application
1. Build the application for production:
   ```bash
   npm run build
   ```
   This will create a production-ready build in the `dist` folder.

2. Verify the build output:
   - Check the `dist` folder for the generated files
   - Ensure the service worker is included
   - Verify that all assets are properly referenced

### 3.3 Deploy to Netlify

#### Using Netlify CLI
1. Install Netlify CLI if not already installed:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize a new Netlify site:
   ```bash
   netlify init
   ```

4. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

5. Follow the prompts to select the `dist` folder as the publish directory.

#### Using Netlify UI
1. Go to [Netlify](https://app.netlify.com/) and log in.
2. Click "New site from Git" or drag and drop the `dist` folder onto the Netlify dashboard.
3. If using Git integration:
   - Connect to your Git provider
   - Select the repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Configure environment variables for S3 credentials
4. Click "Deploy site"

### 3.4 Deploy to Vercel

#### Using Vercel CLI
1. Install Vercel CLI if not already installed:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

4. Follow the prompts to configure your project.

#### Using Vercel UI
1. Go to [Vercel](https://vercel.com/) and log in.
2. Click "New Project" or import from Git repository.
3. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Configure environment variables for S3 credentials.
5. Click "Deploy"

### 3.5 Deploy to AWS S3 + CloudFront

1. Create an S3 bucket for static website hosting:
   - Go to AWS S3 console
   - Create a new bucket
   - Enable static website hosting in bucket properties
   - Set index document to `index.html`
   - Set error document to `index.html` (for SPA routing)

2. Upload the build files:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. Create a CloudFront distribution:
   - Go to AWS CloudFront console
   - Create a new distribution
   - Set origin to your S3 bucket website endpoint
   - Configure cache behavior:
     - Redirect HTTP to HTTPS
     - Allowed HTTP methods: GET, HEAD, OPTIONS
     - Cache policy: CachingOptimized
     - Origin request policy: CORS-S3Origin
   - Configure error pages:
     - 403 -> /index.html -> 200
     - 404 -> /index.html -> 200

4. Configure your domain (optional):
   - Add alternate domain names in CloudFront
   - Request or import SSL certificate using AWS Certificate Manager
   - Update DNS records to point to CloudFront distribution

### 3.6 Post-Deployment Steps

1. Verify HTTPS deployment:
   - Access the deployed application URL in a browser
   - Check for the HTTPS lock icon in the address bar
   - Use online SSL checker tools to verify SSL certificate

2. Verify service worker deployment:
   - Access the deployed application in a browser
   - Open browser DevTools (Application -> Service Workers)
   - Check if the service worker is registered and active
   - Test offline functionality by disconnecting from the internet and reloading

3. Set up custom domain (optional):
   - Configure DNS settings with your domain registrar
   - Point your domain to your hosting provider
   - Set up HTTPS for your custom domain
   - Verify domain is working correctly

4. Integrate production monitoring:
   - Set up Google Analytics or similar service
   - Configure performance monitoring
   - Set up error tracking with Sentry or similar service

## 4. Rollback Procedure

### 4.1 Netlify Rollback
1. Go to the Netlify dashboard
2. Navigate to the "Deploys" tab
3. Find the previous working deploy
4. Click "Publish deploy" to roll back

### 4.2 Vercel Rollback
1. Go to the Vercel dashboard
2. Navigate to the "Deployments" tab
3. Find the previous working deployment
4. Click the three dots menu and select "Promote to Production"

### 4.3 AWS S3/CloudFront Rollback
1. Restore the previous version of files from backup
2. Re-upload to S3:
   ```bash
   aws s3 sync backup-dist/ s3://your-bucket-name --delete
   ```
3. Invalidate CloudFront cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

## 5. Maintenance Procedures
- Refer to the [Maintenance Plan](MAINTENANCE_PLAN.md) for ongoing maintenance procedures.

## 6. Troubleshooting

### Common Deployment Issues
- **404 errors for routes**: Ensure proper SPA routing configuration on your hosting provider
- **Service worker not registering**: Check scope and HTTPS configuration
- **CORS errors**: Verify CORS configuration for S3 bucket
- **Environment variables not working**: Check that they are properly configured in the hosting platform
- **CSS/JS not loading**: Check for path issues in the built files

### Debugging Tools
- Browser DevTools (Network, Application tabs)
- Hosting provider logs
- AWS CloudWatch logs (if using AWS)

---
*This deployment guide is a reference and may need to be adjusted based on your specific hosting environment and requirements.*
