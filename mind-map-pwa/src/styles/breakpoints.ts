/**
 * Breakpoints configuration for responsive design
 * Based on Material UI v7 breakpoint system with custom device categories
 */

export const breakpoints = {
  xs: 0,    // mobile
  sm: 600,  // tablet
  md: 900,  // desktop
  lg: 1200, // widescreen
  xl: 1536  // large widescreen
};

export type Breakpoint = keyof typeof breakpoints;

/**
 * Device category breakpoints for semantic device targeting
 */
export const deviceBreakpoints = {
  mobile: '0px',
  tablet: '600px',
  desktop: '900px',
  widescreen: '1200px'
};

export type DeviceCategory = keyof typeof deviceBreakpoints;

/**
 * Device-specific layout configurations
 */
export const deviceLayouts = {
  mobile: {
    sidebarWidth: '100%',
    mapWidth: '100%',
    toolbarHeight: '56px'
  },
  tablet: {
    sidebarWidth: '320px',
    mapWidth: 'calc(100% - 320px)',
    toolbarHeight: '64px'
  },
  desktop: {
    sidebarWidth: '380px',
    mapWidth: 'calc(100% - 380px)',
    toolbarHeight: '64px'
  },
  widescreen: {
    sidebarWidth: '420px',
    mapWidth: 'calc(100% - 420px)',
    toolbarHeight: '72px'
  }
};

/**
 * Media query helpers for styled components
 */
export const mediaQueries = {
  up: (key: Breakpoint) => `@media (min-width: ${breakpoints[key]}px)`,
  down: (key: Breakpoint) => {
    const nextBreakpoint = getNextBreakpoint(key);
    return nextBreakpoint
      ? `@media (max-width: ${breakpoints[nextBreakpoint] - 0.05}px)`
      : `@media (max-width: ${Number.MAX_SAFE_INTEGER}px)`;
  },
  between: (start: Breakpoint, end: Breakpoint) => {
    const nextBreakpoint = getNextBreakpoint(end);
    return nextBreakpoint
      ? `@media (min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[nextBreakpoint] - 0.05}px)`
      : mediaQueries.up(start);
  },
  only: (key: Breakpoint) => {
    const nextBreakpoint = getNextBreakpoint(key);
    return nextBreakpoint
      ? `@media (min-width: ${breakpoints[key]}px) and (max-width: ${breakpoints[nextBreakpoint] - 0.05}px)`
      : mediaQueries.up(key);
  }
};

/**
 * Helper function to get the next breakpoint
 */
function getNextBreakpoint(key: Breakpoint): Breakpoint | null {
  const keys = Object.keys(breakpoints) as Breakpoint[];
  const index = keys.indexOf(key);
  return index !== -1 && index < keys.length - 1 ? keys[index + 1] : null;
}

/**
 * Fluid typography calculation
 * @param minSize Minimum font size in pixels
 * @param maxSize Maximum font size in pixels
 * @param minWidth Minimum viewport width in pixels
 * @param maxWidth Maximum viewport width in pixels
 * @returns CSS calc expression for fluid typography
 */
export const fluidTypography = (
  minSize: number,
  maxSize: number,
  minWidth: number = breakpoints.sm,
  maxWidth: number = breakpoints.xl
): string => {
  const slope = (maxSize - minSize) / (maxWidth - minWidth);
  const yAxisIntersection = -minWidth * slope + minSize;

  return `clamp(${minSize}px, ${yAxisIntersection.toFixed(2)}px + ${(slope * 100).toFixed(2)}vw, ${maxSize}px)`;
};
