# d.o. Brainstroming Brand Implementation Plan

## I18n Updates

### English (en.json)
```diff
{
  "app": {
-    "title": "Mind Map PWA",
+    "title": "d.o. Brainstroming",
-    "subtitle": "A Progressive Web App for creating mind maps"
+    "subtitle": "A sleek, user-friendly mind mapping app with real-time collaboration"
  },
  "tabs": {
-    "mindMap": "Mind Map",
+    "mindMap": "Brainstorm Map",
    ...
  },
  "mindMap": {
-    "mainIdeaDesc": "This is the central concept of your mind map",
+    "mainIdeaDesc": "This is the central concept of your brainstorm map",
    ...
  }
}
```

### German (de.json)
```diff
{
+  "app": {
+    "title": "d.o. Brainstroming",
+    "subtitle": "Eine benutzerfreundliche Mind-Mapping-App mit Echtzeit-Zusammenarbeit"
+  },
-  "mind_map": "Mind Map",
+  "mind_map": "Brainstorm-Karte",
   "create_map": "Karte erstellen",
   ...
   "map_settings": "Karten-Einstellungen",
   // Add missing translations from en.json:
+  "tabs": {
+    "mindMap": "Brainstorm-Karte",
+    "s3Connection": "S3-Verbindung",
+    "sampleCards": "Beispielkarten"
+  },
+  "s3": {
+    "connectionTest": "S3-Verbindungstest",
+    "connectionError": "S3-Verbindung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.",
+    "noBuckets": "Keine Buckets in Ihrem S3-Konto gefunden.",
+    "connectionSuccess": "Erfolgreich mit S3 verbunden!",
+    "availableBuckets": "Verfügbare Buckets:"
+  }
}
```

## Component Updates (15 files)
- Layout.tsx: Footer copyright
- App.test.tsx: Test assertions
- openRouterService.ts: S3 metadata headers
- Index.html: Meta descriptions

## Documentation Updates

| File | Changes Required |
|------|------------------|
| README.md | Header + 8 body references |
| PROJECT_DOCUMENTATION.md | 4 section headers + 12 content refs |
| DEPLOYMENT_GUIDE.md | 3 instance updates |
| MAINTENANCE_PLAN.md | 2 headers + 5 content refs |

## Testing Strategy

1. Update test regex patterns:
   ```regex
   /Mind\s*Map\s*PWA/gi → /d\.o\.\s*Brainstroming/gi
   /Mind\s*Map/gi → /Brainstorm[- ]Map/gi
   ```
2. Update snapshots:
   ```bash
   npm test -- -u
   ```
3. Validate translations:
   ```bash
   npm run i18n:validate
   ```

## Visual Updates
1. Verify UI text overflow with new brand name
2. Check responsive layouts on:
   - Mobile (320px)
   - Tablet (768px)
   - Desktop (1024px+)
3. Validate PDF exports with new branding

## Implementation Steps
1. Update translation files (en.json, de.json)
2. Update component references
3. Run tests and fix any failed assertions
4. Manual testing of all features
5. Update documentation
