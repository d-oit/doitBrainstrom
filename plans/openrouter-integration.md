# Material UI v7 Migration & OpenRouter Integration Architecture

## 1. Technical Stack Updates

### Material UI v7 Migration
- Update dependencies:
  ```json
  {
    "@mui/material": "^7.0.1",
    "@mui/icons-material": "^7.0.1",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0"
  }
  ```
- Implement CSS variables theme using the new extendTheme API
- Implement new breakpoint system for responsive design
- Update component variants and styling API usage
- Utilize the new CssVarsProvider for theme management

### Development Tools
- Vite v6.2.4 (current)
- React 18.2.0 (current)
- TypeScript 5.3.3 (current)
- Vitest for unit/integration testing
- Playwright for E2E testing

## 2. Responsive Design Architecture

### CSS Variables Theme
```typescript
import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

const theme = extendTheme({
  cssVarPrefix: 'mind-map',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#2196f3',
          light: '#64b5f6',
          dark: '#1976d2',
        },
        // Other palette colors...
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#90caf9',
          light: '#e3f2fd',
          dark: '#42a5f5',
        },
        // Other palette colors...
      },
    },
  },
});
```

### CSS Variables Theme
```typescript
import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

const theme = extendTheme({
  cssVarPrefix: 'mind-map',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#2196f3',
          light: '#64b5f6',
          dark: '#1976d2',
        },
        // Other palette colors...
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#90caf9',
          light: '#e3f2fd',
          dark: '#42a5f5',
        },
        // Other palette colors...
      },
    },
  },
});
```

### Breakpoint System
```typescript
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
};
```

### Theme Provider Implementation
```tsx
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';

// Using CSS Variables Theme Provider
<CssVarsProvider
  theme={theme}
  defaultMode="system"
  modeStorageKey="mind-map-theme-mode"
>
  <CssBaseline />
  {children}
</CssVarsProvider>
```

### Component Layout Strategy
- Mobile-first approach
- Fluid typography using viewport units
- Touch-friendly interaction targets (min 44px)
- Responsive grid system with auto-layout

## 3. OpenRouter Integration

### Service Layer
```typescript
interface OpenRouterConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatResponse {
  message: ChatMessage;
  status: 'complete' | 'streaming';
}
```

### Component Architecture

#### Chat Module Structure
```
src/
├── components/
│   └── Chat/
│       ├── FloatingChatButton.tsx     # Accessibility-first chat trigger
│       ├── ChatWindow.tsx             # Main chat interface container
│       ├── ChatHistory.tsx            # Virtualized message list
│       ├── MessageInput.tsx           # User input with validation
│       └── MessageBubble.tsx          # Individual message display
├── contexts/
│   └── ChatContext.tsx               # Global chat state management
├── hooks/
│   ├── useChat.ts                    # Chat interaction logic
│   └── useChatStream.ts             # Streaming message handler
└── services/
    └── llm/
        ├── openRouterService.ts      # OpenRouter API client
        └── types.ts                  # Shared type definitions
```

### Security Measures
1. Environment-based API key management
2. Input sanitization for all user messages
3. Rate limiting implementation
4. Error boundary protection
5. Request/Response validation

## 4. Testing Strategy

### Unit Tests
- Component rendering tests
- Hook behavior validation
- Service layer mocking
- State management verification

### Integration Tests
```typescript
// Example test structure
describe('ChatWindow Integration', () => {
  test('sends message and receives response');
  test('handles streaming responses');
  test('manages error states');
  test('implements retry logic');
});
```

### E2E Testing (Playwright)
- User interaction flows
- Responsive design validation
- Accessibility compliance
- Performance metrics

## 5. Accessibility Implementation

### WCAG 2.1 AA Compliance
- Screen reader compatibility
- Keyboard navigation support
- Focus management system
- High contrast mode support

### Aria Attributes
```html
<button
  aria-expanded="false"
  aria-controls="chat-panel"
  aria-label="Open chat assistance"
>
```

## 6. Performance Optimizations

### Message Handling
- Virtualized list for chat history
- Debounced input handling
- Cached response storage
- Progressive loading

### Resource Management
- Code splitting for chat module
- Asset optimization
- Service worker caching
- Memory usage monitoring

## 7. Development Timeline

### Phase 1: Material UI v7 Migration (1 week)
- [x] Dependency updates
- [x] CSS variables theme implementation
- [ ] Component migration
- [ ] Style system updates
- [ ] Responsive design implementation

### Phase 2: OpenRouter Integration (2 weeks)
- [ ] Service layer implementation
- [ ] Component development
- [ ] Context/State management
- [ ] Error handling system

### Phase 3: Testing & Optimization (1 week)
- [ ] Unit test coverage
- [ ] Integration test suite
- [ ] E2E test implementation
- [ ] Performance optimization

### Phase 4: Documentation & Deployment (3 days)
- [ ] API documentation
- [ ] Usage guidelines
- [ ] Deployment checklist
- [ ] Monitoring setup

## 8. Monitoring & Maintenance

### Performance Metrics
- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- API response times
- Error rates

### Health Checks
- API availability
- Message delivery status
- Response quality
- System resource usage

## Next Steps

1. ✅ Update Material UI to v7.0.1
2. ✅ Implement CSS variables theme
3. Continue responsive design implementation
4. Set up OpenRouter API credentials
5. Implement chat service prototype
6. Begin component development
7. Set up testing infrastructure