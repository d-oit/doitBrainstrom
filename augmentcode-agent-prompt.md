ANALYZE:
- Parse all `.md` files in `@specs/`
- Map dependencies between specifications
- If exists: validate against `/docs` 
- Audit current codebase state

IMPLEMENT:
- For each specification:
  1. Develop solution based on dependency graph
  2. Verify with `vitetest`
  3. Fix any failing tests
  4. Log completion in `status.md` with {date, feature, changes}

VALIDATE:
- Run development server locally
- Execute Playwright e2e tests
- Resolve any runtime errors