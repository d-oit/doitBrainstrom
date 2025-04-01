# d.o. Brainstroming Brand Implementation Plan

## I18n Updates

### English (en.json)
```diff
{
  "app": {
-    "title": "Mind Map PWA",
+    "title": "d.o. Brainstroming",
-    "subtitle": "A Progressive Web App for creating mind maps",
+    "subtitle": "A sleek, user-friendly mind mapping app with real-time collaboration"
  },
  "tabs": {
-    "mindMap": "Mind Map",
+    "mindMap": "Brainstorm Map"
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
  "mind_map": "Brainstorm-Karte",
  // Add missing translations matching en.json structure
}
```

### Spanish (es.json)
```diff
{
  "app": {
-    "title": "Mapa Mental PWA",
+    "title": "d.o. Brainstroming",
-    "subtitle": "Una aplicación web progresiva para crear mapas mentales",
+    "subtitle": "Una aplicación elegante y fácil de usar para mapas mentales con colaboración en tiempo real"
  },
  "tabs": {
-    "mindMap": "Mapa Mental",
+    "mindMap": "Mapa de Brainstorming"
  }
}
```

### Arabic (ar.json)
```diff
{
  "app": {
-    "title": "تطبيق خريطة العقل",
+    "title": "d.o. Brainstroming",
-    "subtitle": "تطبيق ويب تقدمي لإنشاء خرائط ذهنية",
+    "subtitle": "تطبيق أنيق وسهل الاستخدام للخرائط الذهنية مع التعاون في الوقت الفعلي"
  },
  "tabs": {
-    "mindMap": "خريطة ذهنية",
+    "mindMap": "خريطة العصف الذهني"
  }
}
```

## Component Updates

### React Components
1. Layout.tsx:
   - Footer copyright
   - App header branding
2. App.test.tsx:
   - Test assertions
   - Translation mocks
3. openRouterService.ts:
   - S3 metadata headers
4. Index.html:
   - Meta descriptions
   - Title tags
   - PWA manifest

### Test Updates
1. Update regex patterns:
```typescript
/Mind\s*Map\s*PWA/gi → /d\.o\.\s*Brainstroming/gi
/Mind\s*Map/gi → /Brainstorm[- ]Map/gi
```

2. Update translation mocks in tests:
```typescript
const mockTranslations = {
  'app.title': 'd.o. Brainstroming',
  'app.subtitle': 'A sleek, user-friendly mind mapping app with real-time collaboration'
};
```

## Implementation Steps

1. Update i18n files
   - en.json (base translations)
   - de.json (German)
   - es.json (Spanish)
   - ar.json (Arabic)

2. Update components using brand name
   - Header/title components
   - Footer components
   - Meta tags
   - Documentation references

3. Fix failing tests
   - Update test assertions
   - Refresh snapshots
   - Update translation mocks

4. Manual Testing
   - Verify all translations
   - Check responsive layouts
   - Test RTL support (Arabic)
   - Validate PDF exports
