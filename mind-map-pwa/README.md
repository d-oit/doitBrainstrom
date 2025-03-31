# Mind Map PWA

A Progressive Web Application for creating mind maps, built with Vite, React 18, and TypeScript.

## Project Setup

This project was set up according to the specifications in SETUP-001.md.

## Features

- React 18 with TypeScript
- Vite for fast development and building
- S3 integration for data storage
- Progressive Web App capabilities

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn
   ```

### Development

Start the development server:

```bash
npm run dev
```
or
```bash
yarn dev
```

### Building for Production

Build the project:

```bash
npm run build
```
or
```bash
yarn build
```

### Preview Production Build

Preview the production build:

```bash
npm run preview
```
or
```bash
yarn preview
```

## Project Structure

- `/public` - Static assets
- `/src` - Source code
  - `/components` - React components
  - `/contexts` - React contexts
  - `/hooks` - Custom React hooks
  - `/pages` - Page components
  - `/services` - Service modules (including S3 service)
  - `/styles` - CSS files
  - `/utils` - Utility functions

## Environment Variables

The project uses the following environment variables:

- `VITE_S3_ENDPOINT` - S3 endpoint URL
- `VITE_S3_ACCESS_KEY_ID` - S3 access key ID
- `VITE_S3_SECRET_ACCESS_KEY` - S3 secret access key
- `VITE_S3_BUCKET_NAME` - S3 bucket name

These are configured in the `.env` file.
