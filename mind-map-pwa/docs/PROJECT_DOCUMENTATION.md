# d.o. Brainstroming Project Documentation

## Table of Contents
1. Project Overview
2. Setup Instructions
3. Development Phases
4. Component Architecture
5. API Documentation
6. Deployment Guide
7. Troubleshooting
8. Future Enhancements

## 1. Project Overview
d.o. Brainstroming is a sleek, user-friendly mind mapping app with real-time collaboration. It is built with React 18, TypeScript, and Vite, and features offline capabilities and data synchronization with AWS S3. The application aims to be fully responsive, accessible, performant, and secure, adhering to GDPR guidelines.

### Key Features
- Interactive mind map creation and editing
- Offline-first architecture with IndexedDB storage
- Enhanced background synchronization with AWS S3 including offline queue and conflict resolution
- Comprehensive responsive design system with fluid typography, container queries, and touch interactions
- Comprehensive theme system with light, dark, system, and high-contrast modes
- Internationalization with RTL language support
- Comprehensive accessibility features including screen reader support, keyboard navigation, and color blindness modes
- Performance optimizations for smooth user experience

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Material UI
- **State Management**: React Context API
- **Storage**: IndexedDB for local storage, AWS S3 for cloud storage
- **Offline Support**: Service Worker
- **Internationalization**: Custom i18n implementation with JSON files
- **Testing**: Vitest, React Testing Library, Playwright

## 2. Setup Instructions

### Prerequisites
- Node.js (version >= 16) and npm installed
- Git installed
- AWS S3 bucket or compatible storage service (e.g., MinIO)

### Installation
1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd mind-map-pwa
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Configuration:
   - Create a `.env` file in the project root with the following variables:
   ```
   VITE_S3_ENDPOINT=your-s3-endpoint
   VITE_S3_ACCESS_KEY_ID=your-access-key
   VITE_S3_SECRET_ACCESS_KEY=your-secret-key
   VITE_S3_BUCKET_NAME=your-bucket-name
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application:
   - Open your browser and navigate to `http://localhost:5173`

## 3. Development Phases

### Phase 1: Project Setup and Configuration (SETUP-001)
- Vite project setup with React 18 and TypeScript
- TypeScript configuration with strict type checking
- Environment variables setup for S3 credentials
- Project structure creation
- S3 bucket connection implementation

### Phase 2: UI/UX Design and Implementation (UI-002)
- Material UI v7 integration
- Basic layout components
- Card UI components
- Advanced theme system with system, light, dark, and high-contrast modes
- Color blindness support with specialized color schemes
- Responsive design implementation
- Comprehensive accessibility features

### Phase 3: Core Functionality Development (CORE-003)
- Mind map data model definition
- State management for mind map data
- Mind map node components
- Node linking functionality
- Node editing capabilities

### Phase 3.1: Responsive Design (RESPONSIVE-003-1)
- Modern CSS Grid system with 12-column layout
- Fluid typography using clamp() function
- Container queries for component-level responsiveness
- Touch-friendly controls with proper hit areas
- Advanced gesture handling (pan, pinch, rotate, swipe)
- Viewport adaptation with breakpoints
- Orientation handling and foldable device support
- Safe area insets handling for notched devices
- Density scaling for high-DPI screens

### Phase 4: Offline Support (OFFLINE-004)
- Service worker implementation
- IndexedDB integration with schema versioning
- Enhanced background synchronization with S3
- Version vector-based conflict detection
- Visual conflict resolution UI with diff visualization
- Offline operation queue with priority levels
- Offline-first architecture
- Sync status indicator with detailed status information

### Phase 5: Error Handling (ERROR-005)
- Comprehensive error handling strategy
- Custom error types
- Centralized logging system
- Global error handler
- Error notification system
- React error boundaries
- Graceful degradation in offline mode

### Phase 6: Performance Optimization (PERF-006)
- IndexedDB operation optimization
- Lazy loading implementation
- Code splitting configuration
- State management optimization
- Memoization and caching strategies
- Performance monitoring integration

### Phase 7: Security Implementation (SEC-007)
- Comprehensive accessibility features (WCAG 2.1 AA compliance)
- Keyboard navigation
- Screen reader compatibility
- Semantic HTML implementation
- ARIA attributes
- Security best practices
- GDPR compliance
- Input sanitization and validation
- Secure data handling
- HTTPS enforcement

### Phase 8: Documentation (DOC-008)
- Coding guide creation
- Project documentation
- README.md update
- Inline code comments
- IndexedDB documentation
- Translation management documentation

### Phase 9: Quality Assurance (QA-009)
- Unit testing implementation
- Integration testing
- End-to-End testing with Playwright
- Accessibility testing
- Performance testing
- Cross-browser testing
- Bug reporting and tracking
- Quality assurance report

### Phase 10: Deployment (DEPLOY-011)
- Deployment to static hosting
- HTTPS configuration
- Domain name setup
- Service worker deployment
- Performance monitoring integration
- Error reporting integration
- Maintenance plan
- Deployment documentation

## 4. Component Architecture

### Core Components

#### Layout
The main layout component that provides the application structure with header, main content area, and footer. It includes the theme switcher, locale switcher, and sync status indicator.

#### MindMap
The main mind map component responsible for rendering and managing the mind map. It handles node creation, editing, linking, and interaction.

#### MindMapCard
A reusable card component used for displaying mind map nodes. It's optimized with memoization to prevent unnecessary re-renders. Uses container queries for responsive sizing and touch-friendly interactions.

#### ResponsiveGrid and ResponsiveGridItem
Modern CSS Grid-based layout system with support for different device sizes, responsive column spans, and automatic layout adjustment.

#### ContainerQuery
Creates container query contexts for component-level responsive design, enabling components to adapt based on their own size rather than viewport size.

#### FluidTypography
Implements fluid typography using CSS clamp() function, allowing text to scale smoothly between viewport sizes with appropriate minimum and maximum sizes.

#### TouchFriendly
Enhances elements with touch-friendly properties such as proper hit areas and touch feedback, improving usability on touch devices.

#### GestureHandler
Provides advanced gesture recognition for pan, pinch, rotate, tap, double tap, long press, and swipe gestures, with support for multi-touch interactions.

#### AccessibilityMenu
Provides quick access to accessibility features and settings through a dropdown menu in the application header.

#### AccessibilitySettings
A comprehensive settings dialog for configuring accessibility features including high contrast mode, reduced motion, large text, screen reader support, and color blindness simulation.

#### KeyboardShortcutsHelp
Displays a dialog with all available keyboard shortcuts, organized by category and searchable.

#### SkipLinks
Provides keyboard-accessible links to skip to main content areas, improving navigation for keyboard and screen reader users.

#### FocusIndicator
Creates a visual indicator that follows the focused element, enhancing keyboard navigation visibility.

#### ColorBlindnessFilters
Provides SVG filters for simulating different types of color blindness.

#### ThemeSwitcher
Allows users to switch between light, dark, system, and high-contrast themes. It provides advanced settings for accessibility including color blindness support, reduced motion preferences, and animation controls. It uses the ThemeContext to manage theme state.

#### LocaleSwitcher
Enables users to change the application language. It supports multiple languages including RTL languages like Arabic.

#### SyncStatusIndicator
Displays the current synchronization status between local IndexedDB and S3 storage, including pending operations count, last sync time, and error information. Provides controls for manual sync, processing pending operations, and enabling/disabling background sync.

### Context Providers

#### ThemeContext
Manages the application theme state and provides comprehensive theme functionality including:
- Theme mode switching (light, dark, system, high-contrast)
- CSS variables support for smooth transitions
- Comprehensive accessibility settings (screen reader support, keyboard navigation, reduced motion, high contrast, color blindness modes)
- System preference detection and monitoring
- Theme persistence in localStorage

#### I18nContext
Handles internationalization, including language switching, translation loading, and RTL support.

#### MindMapContext
Manages the mind map data state, including nodes, links, and editing operations.

#### ResponsiveContext
Provides comprehensive viewport and device information including:
- Device type detection (mobile, tablet, desktop, widescreen)
- Orientation detection (portrait, landscape)
- Safe area insets for notched devices
- Reduced motion preferences
- Network status monitoring
- Touch capability detection
- Viewport dimensions and breakpoints

#### AccessibilityContext
Provides accessibility features and utilities throughout the application:
- Screen reader announcements with polite and assertive modes
- Keyboard shortcuts registration and management
- Focus management utilities
- Skip links registration
- Accessibility settings management
- High contrast mode detection
- Reduced motion detection
- Large text mode

#### ErrorNotificationContext
Provides error notification functionality for displaying user-friendly error messages.

### Services

#### s3Service
Handles communication with AWS S3 or compatible storage service.

#### enhancedS3SyncService
Manages synchronization between local IndexedDB and S3 storage with advanced features:
- Offline operation queue with priority levels
- Version vector-based conflict detection
- Exponential backoff retry mechanism
- Background sync with configurable intervals
- Detailed sync status reporting

### Utilities

#### indexedDBPerformance
Provides utilities for optimizing IndexedDB operations, including transaction management, bulk operations, and performance monitoring.

#### performanceMonitoring
Offers utilities for monitoring and measuring application performance.

#### inputSanitization
Contains functions for sanitizing user input to prevent security vulnerabilities.

#### securityConfig
Provides security configuration and utilities for the application.

#### errorHandler
Sets up global error handling and logging.

#### logger
Implements a custom logging system with different log levels.

## 5. API Documentation

### IndexedDB API

#### Database Schema
- **Database Name**: mindMapDB
- **Version**: 2
- **Object Stores**:
  - mindMapData (keyPath: 'id')
    - Indexes:
      - lastModified
      - synced
      - hasConflict
  - offlineOperations (keyPath: 'id')
    - Indexes:
      - status
      - priority
      - timestamp
      - entityId
      - entityType
      - type

#### Core Functions

```typescript
// Initialize the database
const initDB = async (): Promise<IDBDatabase>

// Save mind map data
const saveMindMapData = async (data: MindMapData): Promise<void>

// Load mind map data
const loadMindMapData = async (id: string): Promise<MindMapData | undefined>

// Delete mind map data
const deleteMindMapData = async (id: string): Promise<void>

// List all mind maps
const listMindMaps = async (): Promise<MindMapData[]>

// Get unsynchronized mind maps
const getUnsyncedMindMaps = async (): Promise<MindMapData[]>

// Mark mind map as synchronized
const markAsSynced = async (id: string): Promise<void>
```

### S3 Service API

```typescript
// List S3 buckets
const listBuckets = async (): Promise<AWS.S3.Bucket[]>

// Upload mind map to S3
const uploadMindMap = async (id: string, data: MindMapData): Promise<void>

// Download mind map from S3
const downloadMindMap = async (id: string): Promise<MindMapData | null>

// Delete mind map from S3
const deleteMindMapFromS3 = async (id: string): Promise<void>

// List all mind maps in S3
const listMindMapsInS3 = async (): Promise<string[]>
```

### Synchronization API

```typescript
// Initialize S3 client
const initializeS3 = async (): Promise<{ success: boolean; error?: S3ErrorType; details?: string }>

// Check S3 availability
const checkS3Availability = async (forceCheck?: boolean): Promise<{ available: boolean; error?: S3ErrorType; details?: string }>

// Get sync status
const getSyncStatus = async (): Promise<SyncStatus>

// Save to S3
const saveToS3 = async (mindMapData: MindMapData, mindMapId?: string): Promise<SaveResult>

// Get from S3
const getFromS3 = async (): Promise<{ data: MindMapData | null; error?: S3ErrorType; details?: string }>

// Initialize mind map data
const initializeMindMapData = async (defaultId?: string): Promise<MindMapInitResult>

// Process pending operations
const processPendingOperations = async (limit?: number): Promise<SyncResult>

// Sync mind map data
const syncMindMapData = async (mindMapId?: string, force?: boolean): Promise<SyncResult>

// Enable background sync
const enableBackgroundSync = (intervalMs?: number): void

// Disable background sync
const disableBackgroundSync = (): void

// Register background sync with service worker
const registerBackgroundSync = async (): Promise<boolean>
```

## 6. Deployment Guide

### Building for Production
```bash
npm run build
```
This will create a production-ready build in the `dist` directory.

### Deployment Options

#### Netlify
1. Create a new site in Netlify
2. Connect to your Git repository
3. Set build command to `npm run build`
4. Set publish directory to `dist`
5. Configure environment variables for S3 credentials
6. Deploy the site

#### Vercel
1. Create a new project in Vercel
2. Connect to your Git repository
3. Set build command to `npm run build`
4. Set output directory to `dist`
5. Configure environment variables for S3 credentials
6. Deploy the project

#### AWS S3 + CloudFront
1. Create an S3 bucket for static website hosting
2. Build the application with `npm run build`
3. Upload the contents of the `dist` directory to the S3 bucket
4. Create a CloudFront distribution pointing to the S3 bucket
5. Configure HTTPS and custom domain if needed

### Post-Deployment Steps
1. Verify the application works correctly in production
2. Test offline functionality
3. Verify service worker registration
4. Test synchronization with S3
5. Check performance and accessibility in production

## 7. Troubleshooting

### Common Issues

#### Development Server Issues
- **Problem**: Vite development server fails to start
- **Solution**: Check for port conflicts, restart terminal, or check Vite configuration

#### S3 Connection Issues
- **Problem**: Cannot connect to S3 bucket
- **Solution**: Verify S3 credentials in `.env` file, check network connectivity, ensure bucket exists and is accessible

#### IndexedDB Issues
- **Problem**: IndexedDB operations fail
- **Solution**: Check browser support, verify database schema, check for storage quota issues

#### Service Worker Issues
- **Problem**: Service worker not registering or updating
- **Solution**: Check service worker registration in browser DevTools, clear browser cache, verify service worker code

#### Offline Mode Issues
- **Problem**: Application doesn't work offline
- **Solution**: Verify service worker is active, check cache storage, ensure offline fallbacks are implemented

#### Synchronization Issues
- **Problem**: Data not synchronizing with S3
- **Solution**: Check network connectivity, verify S3 credentials, check for conflicts in data

### Debugging Tools
- Browser DevTools (Application tab for IndexedDB and Service Worker)
- React DevTools for component debugging
- Performance monitoring tools in the application
- Error logs in browser console

## 8. Future Enhancements

### Planned Features
- Collaborative editing capabilities
- Advanced mind map visualization options
- Export/import functionality (PDF, PNG, JSON)
- User accounts and authentication
- Advanced search and filtering
- Template library for common mind map structures
- Mobile app wrapper (React Native or PWA install)

### Technical Improvements
- State management with Redux or Zustand for more complex state
- WebSocket integration for real-time collaboration
- Advanced offline conflict resolution strategies
- Performance optimizations for large mind maps
- Enhanced accessibility features
- Advanced analytics and telemetry

---
*This project documentation is a living document and will be updated as the project evolves.*
