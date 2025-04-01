# Coding Guide for d.o. Brainstroming Project

## Table of Contents
1. Introduction
2. Project Structure
3. IndexedDB Implementation Guide
4. Coding Standards (TypeScript, React)
5. Component Design Principles
6. State Management Guidelines
7. Error Handling and Logging Conventions
8. Accessibility Best Practices
9. Security Guidelines
10. Testing Strategy
11. Deployment Process
12. Contribution Guidelines

## 1. Introduction
This coding guide provides standards and best practices for developing the d.o. Brainstroming project.
Adhering to these guidelines will ensure code consistency, maintainability, and scalability.

## 2. Project Structure
```
- src/
  - components/       # React components
  - contexts/         # React contexts for state management
    - IndexedDBContext/    # IndexedDB context and hooks
  - hooks/            # Custom React hooks
    - useIndexedDB/       # IndexedDB operation hooks
  - pages/            # Page components (if applicable)
  - services/         # Service modules
    - s3Service.ts    # AWS S3 service
    - s3SyncService.ts # S3 synchronization service
  - styles/           # CSS and style-related files
  - utils/            # Utility functions and helpers
    - indexedDB/      # IndexedDB utilities
    - errorHandler.ts # Error handling utilities
    - logger.ts       # Logging utilities
    - performanceMonitoring.ts # Performance monitoring utilities
    - securityConfig.ts # Security configuration
    - inputSanitization.ts # Input sanitization utilities
  - App.tsx           # Main App component
  - main.tsx          # Application entry point
  - serviceWorker.ts  # Service worker for offline capabilities
- public/             # Public assets
- .env                # Environment variables
- vite.config.ts      # Vite configuration
- tsconfig.json       # TypeScript configuration
- package.json        # Package dependencies and scripts
- README.md           # Project README
```

## 3. IndexedDB Implementation Guide

### Database Schema
```typescript
interface MindMapData {
  id: string;
  nodes: Node[];
  links: Link[];
  lastModified: string;
  synced: boolean;
}

interface Node {
  id: string;
  text: string;
  position: { x: number; y: number };
  // ... other node properties
}

interface Link {
  id: string;
  sourceId: string;
  targetId: string;
  // ... other link properties
}
```

### Database Operations

#### Initialization
```typescript
// Initialize IndexedDB
const initDB = async () => {
  const db = await openDB('mindMapDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('mindMapData')) {
        db.createObjectStore('mindMapData', { keyPath: 'id' });
      }
    },
  });
  return db;
};
```

#### Data Operations
```typescript
// Save mind map data
const saveMindMapData = async (data: MindMapData) => {
  const db = await initDB();
  await db.put('mindMapData', {
    ...data,
    lastModified: new Date().toISOString(),
  });
};

// Load mind map data
const loadMindMapData = async (id: string) => {
  const db = await initDB();
  return await db.get('mindMapData', id);
};
```

### Sync Strategy
1. **Background Sync:**
   - Uses Service Worker sync event
   - Implements retry logic with exponential backoff
   - Handles conflict resolution

2. **Conflict Resolution:**
   - Timestamp-based resolution
   - Last-write-wins strategy
   - User notification for conflicts

### Error Handling
```typescript
try {
  await saveMindMapData(data);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // Handle storage limit exceeded
  } else {
    // Handle other IndexedDB errors
  }
}
```

### Performance Optimization
1. **Transaction Management:**
   - Use the `withTransaction` utility from `indexedDBPerformance.ts`
   - Implement proper transaction scoping

2. **Bulk Operations:**
   - Use the `bulkOperation` utility for large datasets
   - Implement chunking for better UI responsiveness

3. **Index Usage:**
   - Create appropriate indexes for frequent queries
   - Use the `createOptimizedIndex` utility

### Security Considerations
1. **Data Validation**
   - Use the `validateAndSanitize` utility from `inputSanitization.ts`
   - Implement strict type checking

2. **Input Sanitization**
   - Use the `sanitizeTextInput` utility for all user inputs
   - Sanitize objects with `sanitizeObject` utility

3. **Access Control**
   - Implement origin validation with `validateOrigin` from `securityConfig.ts`
   - Enforce secure context for sensitive operations

4. **Data Encryption**
   - Consider encrypting sensitive data before storage
   - Use the Web Crypto API for encryption/decryption

5. **Data Cleanup**
   - Implement regular data cleanup with `performDataCleanup` from `securityConfig.ts`
   - Adhere to the retention policy defined in `securityConfig.ts`

## 4. Coding Standards (TypeScript, React)

### TypeScript
- Use strict mode in `tsconfig.json`
- Define clear interfaces and types for all data structures
- Avoid using `any` type where possible
- Use type guards for runtime type checking
- Follow consistent naming conventions:
  - PascalCase for interfaces, types, and classes
  - camelCase for variables, functions, and methods
  - UPPER_SNAKE_CASE for constants

### React
- Use functional components with hooks
- Implement proper prop typing with TypeScript interfaces
- Use React.memo for performance optimization where appropriate
- Implement lazy loading for components that aren't needed immediately
- Follow component composition patterns
- Use proper key props in lists
- Avoid inline function definitions in render methods
- Implement error boundaries for component error handling

## 5. Component Design Principles

### Reusability
- Design components to be reusable across different parts of the application
- Use props for configuration and customization
- Avoid hardcoding values that might change

### Modularity
- Break down UI into modular, independent components
- Follow the single responsibility principle
- Keep component files small and focused

### Composability
- Design components that can be easily composed together
- Use the children prop for flexible composition
- Implement compound components pattern for complex UIs

### Accessibility
- Use semantic HTML elements
- Implement ARIA attributes for dynamic content
- Ensure keyboard navigation works properly
- Test with screen readers
- Follow WCAG 2.2 Level AA guidelines
- Support high contrast mode
- Implement reduced motion preferences
- Provide color blindness accommodations
- Ensure proper focus management

## 6. State Management Guidelines

### Context API
- Use React Context API for application-wide state
- Create separate contexts for different domains (theme, i18n, mind map data)
- Implement context providers with proper typing
- Use context consumers or useContext hook for accessing context values

### Local Component State
- Use useState for simple component state
- Use useReducer for complex state logic
- Implement proper state initialization

### Performance Considerations
- Use useMemo for expensive computations
- Use useCallback for function memoization
- Implement React.memo for component memoization
- Avoid unnecessary re-renders by optimizing state updates

## 7. Error Handling and Logging Conventions

### Global Error Handling
- Use the global error handler from `errorHandler.ts`
- Implement window.onerror and unhandledrejection event handlers
- Use React error boundaries for component errors

### Logging
- Use the logger utility from `logger.ts`
- Implement different log levels (error, warn, info, debug)
- Include contextual information in log messages
- Avoid logging sensitive information

### User Notifications
- Use the ErrorNotificationContext for user-facing error messages
- Implement toast notifications for transient messages
- Provide clear error messages with recovery actions when possible

## 8. Accessibility Best Practices

### Semantic HTML
- Use appropriate HTML elements (header, main, footer, etc.)
- Use heading levels correctly (h1, h2, etc.)
- Use lists (ul, ol) for list content
- Use buttons for interactive elements
- Ensure proper document structure with landmarks

### ARIA Attributes
- Add aria-label for elements without visible text
- Use aria-expanded for expandable elements
- Implement aria-live regions for dynamic content
- Use role attributes appropriately
- Add aria-current for indicating current state

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Implement logical tab order
- Use tabIndex appropriately
- Provide keyboard shortcuts for common actions
- Create visible focus indicators that meet WCAG 2.2 requirements
- Implement focus trapping for modals and dialogs

### Screen Reader Support
- Test with screen readers (NVDA, VoiceOver, JAWS)
- Ensure all content is announced correctly
- Provide text alternatives for non-text content
- Implement proper form labels
- Add descriptive names for interactive elements

### Visual Accessibility
- Support high contrast mode
- Implement color schemes for different types of color blindness
- Ensure sufficient color contrast (minimum 4.5:1 for normal text)
- Avoid conveying information through color alone
- Support text resizing up to 200% without loss of content

### Motion and Animation
- Respect prefers-reduced-motion media query
- Provide controls to pause, stop, or hide moving content
- Avoid content that flashes more than three times per second
- Make animations optional where possible

## 9. Security Guidelines

### Input Validation and Sanitization
- Use the utilities in `inputSanitization.ts` for all user inputs
- Implement client-side validation for form inputs
- Sanitize data before storing in IndexedDB
- Validate data types and formats

### HTTPS and Secure Context
- Use the `enforceHttps` utility from `securityConfig.ts`
- Check for secure context with `isSecureContext`
- Implement HSTS headers in production

### Content Security Policy
- Follow the CSP directives defined in `securityConfig.ts`
- Avoid inline scripts and styles
- Use nonces or hashes for necessary inline content

### GDPR Compliance
- Follow the GDPR settings in `securityConfig.ts`
- Implement data minimization principles
- Provide data access and deletion capabilities
- Adhere to the defined retention policy

## 10. Testing Strategy

### Unit Testing
- Write unit tests for utility functions and hooks
- Use Vitest as the testing framework
- Implement test coverage for critical functionality
- Follow the AAA pattern (Arrange, Act, Assert)

### Component Testing
- Test components with @testing-library/react
- Test both rendering and interactions
- Mock dependencies as needed
- Test accessibility with axe-core

### Integration Testing
- Test component interactions
- Test data flow between components
- Test context providers and consumers
- Test form submissions and API interactions

### End-to-End Testing
- Use Playwright for E2E testing
- Test critical user flows
- Test across different browsers
- Test responsive behavior

## 11. Deployment Process

### Build Process
- Use `npm run build` to create a production build
- Verify the build output in the `dist` directory
- Test the production build locally before deployment

### Deployment to Static Hosting
- Deploy to a static hosting service (Netlify, Vercel, AWS S3)
- Configure HTTPS and custom domain if needed
- Set up proper caching headers
- Configure service worker for PWA functionality

### Monitoring and Analytics
- Implement performance monitoring in production
- Set up error tracking with a service like Sentry
- Configure analytics for usage tracking
- Monitor service worker and offline capabilities

## 12. Contribution Guidelines

### Git Workflow
- Use feature branches for new features or bug fixes
- Follow conventional commit message format
- Submit pull requests for code changes
- Request code reviews before merging

### Code Review Process
- Review code for functionality, performance, and security
- Check for adherence to coding standards
- Verify test coverage
- Provide constructive feedback

### Documentation
- Update documentation when making significant changes
- Document complex algorithms and business logic
- Keep the README and other docs up to date
- Document known issues and workarounds

---
*This coding guide is a living document and will be updated as the project evolves.*
