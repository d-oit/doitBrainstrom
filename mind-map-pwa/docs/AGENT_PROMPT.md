# Mind Map PWA - Agent Prompt

This document provides a structured approach for implementing and validating specifications for the Mind Map PWA project.

## ANALYZE:
- Parse all `.md` files in `@specs/`
- Map dependencies between specifications
- If exists: validate against `/docs` 
- Audit current codebase state

## IMPLEMENT:
- For each specification:
  1. Develop solution based on dependency graph
  2. Verify with `vitetest`
  3. Fix any failing tests
  4. Log completion in `status.md` with {date, feature, changes}

## VALIDATE:
- Run development server locally
- Execute Playwright e2e tests
- Resolve any runtime errors

## Dependency Graph

The following dependency graph shows the relationships between specifications:

```
SETUP-001 (Project Setup)
    ↓
UI-002 (UI/UX Design)
    ↓
CORE-003 (Core Functionality)
    ↓
    ├→ RESPONSIVE-003-1 (Responsive Design)
    ↓
OFFLINE-004 (Offline Support)
    ↓
ERROR-005 (Error Handling)
    ↓
PERF-006 (Performance Optimization)
    ↓
SEC-007 (Security Implementation)
    ↓
DOC-008 (Documentation)
    ↓
QA-009 (Quality Assurance)
    ↓
I18N-010 (Internationalization)
    ↓
DEPLOY-011 (Deployment)
```

## Implementation Status

The current implementation status is tracked in the `status.md` file. Each specification should be implemented in the order shown in the dependency graph to ensure that dependencies are satisfied.

## Testing Strategy

1. **Unit Tests**: Use Vitest to test individual components and utilities
2. **Integration Tests**: Test interactions between components
3. **End-to-End Tests**: Use Playwright to test complete user flows
4. **Accessibility Tests**: Ensure WCAG 2.1 compliance
5. **Performance Tests**: Measure and optimize performance metrics

## Documentation Requirements

For each implemented specification:
1. Update the corresponding documentation in the `docs/` directory
2. Add implementation details to the `status.md` file
3. Include the date, feature name, and changes made

## Validation Criteria

A specification is considered successfully implemented when:
1. All tests pass
2. Documentation is complete and accurate
3. The feature works correctly in the development environment
4. No runtime errors occur during testing
