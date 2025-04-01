# Full Screen Layout Fix Plan

## Problem Statement
The current application doesn't use the full screen as required. Several layout issues need to be fixed to ensure the application properly utilizes the entire viewport.

## Issues Identified
1. **Body Element Styling**: The body element in index.css has `display: flex` and `place-items: center` which centers content rather than using the full screen.
2. **ReactFlowAdapter Height**: The ReactFlowAdapter component has a fixed height of '70vh' which limits the mind map's vertical space.
3. **Responsive Design**: While there are responsive styles, they may not be optimized for full-screen usage.

## Implementation Plan

### 1. Fix index.css
Update the base styling to ensure the body and root elements use the full screen:

```css
/* From: */
body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

/* To: */
body {
  margin: 0;
  padding: 0;
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#root {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
```

### 2. Update App.css
Modify the App.css to ensure the container uses the full viewport:

```css
/* Add these styles: */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
}
```

### 3. Update Layout Component
Ensure the Layout component properly fills the screen:

```tsx
// In Layout.tsx
<Box sx={{ 
  direction: dir, 
  display: 'flex', 
  flexDirection: 'column', 
  minHeight: '100vh', 
  width: '100%' 
}} className="app-container">
  {/* ... */}
  <main 
    id="main-content" 
    tabIndex={-1} 
    role="main" 
    aria-label={t('accessibility.mainContent')}
    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
  >
    {/* ... */}
  </main>
  {/* ... */}
</Box>
```

### 4. Update ReactFlowAdapter Component
Change the fixed height to use the available space:

```tsx
// In ReactFlowAdapter.tsx
<Paper
  elevation={2}
  sx={{
    height: '100%', // Changed from '70vh'
    width: '100%',
    overflow: 'hidden',
    borderRadius: 2,
    flex: 1 // Added to fill available space
  }}
>
  {/* ReactFlow component */}
</Paper>
```

### 5. Update MindMap Component
Ensure the MindMap component fills its container:

```tsx
// In MindMap.tsx
<Box sx={{ 
  display: 'flex', 
  flexDirection: 'column', 
  height: '100%', 
  flex: 1 // Added to fill available space
}}>
  {/* ... */}
  <ContainerQuery type="component">
    <Box sx={{ 
      position: 'relative', 
      flexGrow: 1,
      height: '100%' // Added to ensure full height
    }}>
      {/* ... */}
    </Box>
  </ContainerQuery>
</Box>
```

### 6. Update FlowOrchestrator Component
Ensure the FlowOrchestrator component uses the full width:

```tsx
// In FlowOrchestrator.tsx
<Box sx={{ 
  width: '100%',
  height: '100%', // Added to ensure full height
  display: 'flex',
  flexDirection: 'column'
}}>
  {/* ... */}
</Box>
```

## Testing Plan
1. Run the application in the browser
2. Verify that the layout uses the full screen
3. Test on different viewport sizes to ensure responsiveness
4. Verify that the mind map properly scales to fill the available space
5. Check that all functionality works correctly with the new layout

## Implementation Steps
1. Modify index.css
2. Update App.css
3. Update Layout.tsx
4. Update ReactFlowAdapter.tsx
5. Update MindMap.tsx
6. Update FlowOrchestrator.tsx
7. Test the application
8. Fix any additional issues that arise during testing