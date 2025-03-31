# Mind Map PWA

## Project Overview
A Progressive Web Application for brainstorming and mind mapping, built with React 18, TypeScript, and Vite. Features offline capabilities, S3 data sync, responsive design, accessibility, and security.

## Key Features
- Interactive mind map creation and editing
- Offline-first architecture with IndexedDB storage
- Background synchronization with AWS S3
- Responsive design for all device sizes
- Dark/light/system theme support
- Internationalization with RTL language support
- Accessibility compliance (WCAG 2.1 Level AA)
- Performance optimizations

## Documentation
- [Project Documentation](docs/PROJECT_DOCUMENTATION.md) - Comprehensive project documentation
- [Coding Guide](docs/CODING_GUIDE.md) - Coding standards and best practices
- [Phase Specifications](specs/) - Detailed specifications for each development phase

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm
- AWS S3 bucket or compatible storage service

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with the following variables:
   ```
   VITE_S3_ENDPOINT=your-s3-endpoint
   VITE_S3_ACCESS_KEY_ID=your-access-key
   VITE_S3_SECRET_ACCESS_KEY=your-secret-key
   VITE_S3_BUCKET_NAME=your-bucket-name
   ```

### Development

Start the development server:

```bash
npm run dev
```

### Building for Production

Build the project:

```bash
npm run build
```

### Preview Production Build

Preview the production build:

```bash
npm run preview
```

## Project Structure

- `/public` - Static assets
- `/src` - Source code
  - `/components` - React components
  - `/contexts` - React contexts for state management
  - `/hooks` - Custom React hooks
  - `/services` - Service modules (S3 service, sync service)
  - `/styles` - CSS and style-related files
  - `/utils` - Utility functions and helpers
    - `/indexedDB` - IndexedDB utilities
    - `errorHandler.ts` - Error handling utilities
    - `logger.ts` - Logging utilities
    - `performanceMonitoring.ts` - Performance monitoring
    - `securityConfig.ts` - Security configuration
    - `inputSanitization.ts` - Input sanitization
  - `App.tsx` - Main App component
  - `main.tsx` - Application entry point
  - `serviceWorker.ts` - Service worker for offline capabilities
- `/docs` - Project documentation
- `/specs` - Project specifications

## Environment Variables

The project uses the following environment variables in the `.env` file:

- `VITE_S3_ENDPOINT` - S3 endpoint URL
- `VITE_S3_ACCESS_KEY_ID` - S3 access key ID
- `VITE_S3_SECRET_ACCESS_KEY` - S3 secret access key
- `VITE_S3_BUCKET_NAME` - S3 bucket name

## Testing

Run the test suite:

```bash
npm run test
```

Run tests with UI:

```bash
npm run test:ui
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run end-to-end tests:

```bash
npm run test:e2e
```

## Contributing
Refer to the [Contribution Guidelines](docs/CODING_GUIDE.md#12-contribution-guidelines) in the Coding Guide.

## License
MIT License

---
*Last updated: May 2023*
