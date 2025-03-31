# specs/RESPONSIVE-003.md

## Phase 3: Responsive Design & Mobile-First Approach (RESPONSIVE-003)

**Functional Requirements:**
1. **Viewport Adaptation:** Responsive layout from 320px (mobile) to 4K displays
2. **Touch Optimization:** Gesture support and touch-friendly controls
3. **Adaptive UI Components:** Components that adjust based on screen size
4. **Orientation Handling:** Landscape/portrait mode adaptations
5. **Density Scaling:** Pixel density adaptation for high-DPI screens
6. **Network-Aware UI:** Adjust functionality based on connection quality
7. **Memory Management:** Component virtualization for large datasets

**Edge Cases:**
1. **Foldable Devices:** Screen span modes and hinge detection
2. **Notch/Cutout Areas:** Safe area insets handling
3. **Zoom/Pinch Gestures:** Conflict with mind map navigation
4. **Keyboard Interactions:** Mobile virtual keyboard layout shifts
5. **Low-Power Mode:** Throttled animations and background processes
6. **Mixed DPI Multi-Monitor:** Window dragging between different DPIs
7. **System Font Scaling:** Accommodate OS-level font size changes

**Constraints:**
1. Mobile-first CSS methodology
2. Minimum tap target size of 48px
3. Max layout shift score of 0.1
4. 60fps animation performance
5. Graceful degradation for legacy browsers

**Pseudocode:**
```pseudocode
// Module: layout/ResponsiveLayout.tsx

// Function: useViewportAdaptation
function useViewportAdaptation() {
  // TDD Anchor: test_viewport_breakpoints
  const [breakpoint, setBreakpoint] = useState('mobile');
  
  useEffect(() => {
    const handler = () => {
      const width = window.innerWidth;
      setBreakpoint(
        width >= 1440 ? 'desktop' :
        width >= 768 ? 'tablet' : 'mobile'
      );
    };
    
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return breakpoint;
}

// Module: components/MindMapCanvas.tsx
function MindMapCanvas() {
  const breakpoint = useViewportAdaptation();
  
  // TDD Anchor: test_canvas_responsiveness
  const canvasConfig = {
    mobile: { nodeSize: 32, fontScale: 0.8 },
    tablet: { nodeSize: 40, fontScale: 1.0 },
    desktop: { nodeSize: 48, fontScale: 1.2 }
  }[breakpoint];

  return (
    <Canvas 
      scale={canvasConfig.fontScale}
      onPinch={handlePinchGesture}
      onPan={handlePanGesture}
    >
      {nodes.map(node => (
        <Node 
          size={canvasConfig.nodeSize}
          touchPadding={20}
        />
      ))}
    </Canvas>
  );
}

// Module: styles/responsive.css
@media (max-width: 767px) {
  .toolbar {
    position: fixed;
    bottom: 0;
    grid-template-columns: repeat(auto-fit, minmax(48px, 1fr));
  }
  
  .node-text {
    font-size: 14px;
    line-height: 1.2;
  }
}

@media (min-width: 768px) and (max-width: 1439px) {
  .toolbar {
    position: relative;
    grid-template-columns: repeat(6, 64px);
  }
  
  .node-text {
    font-size: 16px;
    line-height: 1.3;
  }
}

@media (min-width: 1440px) {
  .toolbar {
    position: absolute;
    grid-template-columns: repeat(8, 72px);
  }
  
  .node-text {
    font-size: 18px;
    line-height: 1.4;
  }
}