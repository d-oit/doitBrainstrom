// src/components/touch/GestureHandler.tsx
import React, { ReactNode, useRef, useState, useEffect } from 'react';
import { useResponsive } from '../../contexts/ResponsiveContext';

interface Point {
  x: number;
  y: number;
}

interface GestureState {
  startPoint: Point | null;
  lastPoint: Point | null;
  currentPoint: Point | null;
  startDistance: number | null;
  currentDistance: number | null;
  startAngle: number | null;
  currentAngle: number | null;
  isGesturing: boolean;
  isPinching: boolean;
  isRotating: boolean;
  isPanning: boolean;
  scale: number;
  rotation: number;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

interface GestureHandlerProps {
  children: ReactNode;
  onPan?: (state: GestureState) => void;
  onPanStart?: (state: GestureState) => void;
  onPanEnd?: (state: GestureState) => void;
  onPinch?: (state: GestureState) => void;
  onPinchStart?: (state: GestureState) => void;
  onPinchEnd?: (state: GestureState) => void;
  onRotate?: (state: GestureState) => void;
  onRotateStart?: (state: GestureState) => void;
  onRotateEnd?: (state: GestureState) => void;
  onTap?: (state: GestureState) => void;
  onDoubleTap?: (state: GestureState) => void;
  onLongPress?: (state: GestureState) => void;
  onSwipe?: (state: GestureState) => void;
  disabled?: boolean;
  disablePan?: boolean;
  disablePinch?: boolean;
  disableRotate?: boolean;
  disableTap?: boolean;
  disableDoubleTap?: boolean;
  disableLongPress?: boolean;
  disableSwipe?: boolean;
  threshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  swipeVelocityThreshold?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

/**
 * GestureHandler component
 * Provides gesture recognition for pan, pinch, rotate, tap, double tap,
 * long press, and swipe gestures
 */
export const GestureHandler: React.FC<GestureHandlerProps> = ({
  children,
  onPan,
  onPanStart,
  onPanEnd,
  onPinch,
  onPinchStart,
  onPinchEnd,
  onRotate,
  onRotateStart,
  onRotateEnd,
  onTap,
  onDoubleTap,
  onLongPress,
  onSwipe,
  disabled = false,
  disablePan = false,
  disablePinch = false,
  disableRotate = false,
  disableTap = false,
  disableDoubleTap = false,
  disableLongPress = false,
  disableSwipe = false,
  threshold = 10,
  longPressDelay = 500,
  doubleTapDelay = 300,
  swipeVelocityThreshold = 0.5,
  className = '',
  style,
  as: Component = 'div'
}) {
  const { power } = useResponsive();
  const elementRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const longPressTimeoutRef = useRef<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const velocityTrackerRef = useRef<{ time: number; x: number; y: number }[]>([]);
  
  const [gestureState, setGestureState] = useState<GestureState>({
    startPoint: null,
    lastPoint: null,
    currentPoint: null,
    startDistance: null,
    currentDistance: null,
    startAngle: null,
    currentAngle: null,
    isGesturing: false,
    isPinching: false,
    isRotating: false,
    isPanning: false,
    scale: 1,
    rotation: 0,
    deltaX: 0,
    deltaY: 0,
    velocityX: 0,
    velocityY: 0,
    direction: null
  });
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (longPressTimeoutRef.current) {
        window.clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);
  
  // Calculate distance between two points
  const getDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };
  
  // Calculate angle between two points
  const getAngle = (p1: Point, p2: Point): number => {
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  };
  
  // Get touch points from event
  const getTouchPoints = (event: React.TouchEvent): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i < event.touches.length; i++) {
      points.push({
        x: event.touches[i].clientX,
        y: event.touches[i].clientY
      });
    }
    return points;
  };
  
  // Calculate velocity
  const calculateVelocity = () => {
    const tracker = velocityTrackerRef.current;
    if (tracker.length < 2) return { x: 0, y: 0 };
    
    const newest = tracker[tracker.length - 1];
    const oldest = tracker[0];
    const timeDiff = newest.time - oldest.time;
    
    if (timeDiff === 0) return { x: 0, y: 0 };
    
    const velocityX = (newest.x - oldest.x) / timeDiff;
    const velocityY = (newest.y - oldest.y) / timeDiff;
    
    return { x: velocityX, y: velocityY };
  };
  
  // Determine swipe direction
  const getSwipeDirection = (velocityX: number, velocityY: number): 'left' | 'right' | 'up' | 'down' | null => {
    const absX = Math.abs(velocityX);
    const absY = Math.abs(velocityY);
    
    if (absX < swipeVelocityThreshold && absY < swipeVelocityThreshold) {
      return null;
    }
    
    if (absX > absY) {
      return velocityX > 0 ? 'right' : 'left';
    } else {
      return velocityY > 0 ? 'down' : 'up';
    }
  };
  
  // Handle touch start
  const handleTouchStart = (event: React.TouchEvent) => {
    if (disabled) return;
    
    // Clear any existing timeouts
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (longPressTimeoutRef.current) {
      window.clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    
    // Reset velocity tracker
    velocityTrackerRef.current = [];
    
    const points = getTouchPoints(event);
    if (points.length === 0) return;
    
    const now = Date.now();
    
    // Track for velocity calculation
    velocityTrackerRef.current.push({
      time: now,
      x: points[0].x,
      y: points[0].y
    });
    
    // Set initial state
    const newState: GestureState = {
      startPoint: points[0],
      lastPoint: points[0],
      currentPoint: points[0],
      startDistance: points.length > 1 ? getDistance(points[0], points[1]) : null,
      currentDistance: points.length > 1 ? getDistance(points[0], points[1]) : null,
      startAngle: points.length > 1 ? getAngle(points[0], points[1]) : null,
      currentAngle: points.length > 1 ? getAngle(points[0], points[1]) : null,
      isGesturing: true,
      isPinching: points.length > 1,
      isRotating: points.length > 1,
      isPanning: points.length === 1,
      scale: 1,
      rotation: 0,
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0,
      direction: null
    };
    
    setGestureState(newState);
    
    // Start long press timer
    if (!disableLongPress) {
      longPressTimeoutRef.current = window.setTimeout(() => {
        if (onLongPress) {
          onLongPress(newState);
        }
        longPressTimeoutRef.current = null;
      }, longPressDelay);
    }
    
    // Call gesture start handlers
    if (points.length === 1 && !disablePan) {
      if (onPanStart) {
        onPanStart(newState);
      }
    }
    
    if (points.length > 1) {
      if (!disablePinch && onPinchStart) {
        onPinchStart(newState);
      }
      
      if (!disableRotate && onRotateStart) {
        onRotateStart(newState);
      }
    }
  };
  
  // Handle touch move
  const handleTouchMove = (event: React.TouchEvent) => {
    if (disabled || !gestureState.isGesturing) return;
    
    // Prevent default to avoid scrolling
    event.preventDefault();
    
    const points = getTouchPoints(event);
    if (points.length === 0) return;
    
    const now = Date.now();
    
    // Track for velocity calculation (limit to 5 points)
    velocityTrackerRef.current.push({
      time: now,
      x: points[0].x,
      y: points[0].y
    });
    
    if (velocityTrackerRef.current.length > 5) {
      velocityTrackerRef.current.shift();
    }
    
    // Calculate velocity
    const velocity = calculateVelocity();
    
    // Update state based on current touch points
    const newState: GestureState = {
      ...gestureState,
      lastPoint: gestureState.currentPoint,
      currentPoint: points[0],
      currentDistance: points.length > 1 ? getDistance(points[0], points[1]) : gestureState.currentDistance,
      currentAngle: points.length > 1 ? getAngle(points[0], points[1]) : gestureState.currentAngle,
      isPinching: points.length > 1,
      isRotating: points.length > 1,
      isPanning: points.length === 1,
      velocityX: velocity.x,
      velocityY: velocity.y
    };
    
    // Calculate deltas
    if (gestureState.startPoint && newState.currentPoint) {
      newState.deltaX = newState.currentPoint.x - gestureState.startPoint.x;
      newState.deltaY = newState.currentPoint.y - gestureState.startPoint.y;
    }
    
    // Calculate scale for pinch
    if (gestureState.startDistance && newState.currentDistance) {
      newState.scale = newState.currentDistance / gestureState.startDistance;
    }
    
    // Calculate rotation
    if (gestureState.startAngle && newState.currentAngle) {
      newState.rotation = newState.currentAngle - gestureState.startAngle;
    }
    
    // Determine direction
    newState.direction = getSwipeDirection(velocity.x, velocity.y);
    
    setGestureState(newState);
    
    // Call gesture handlers
    if (points.length === 1 && !disablePan) {
      if (onPan) {
        onPan(newState);
      }
    }
    
    if (points.length > 1) {
      if (!disablePinch && onPinch) {
        onPinch(newState);
      }
      
      if (!disableRotate && onRotate) {
        onRotate(newState);
      }
    }
    
    // If we're moving, cancel long press
    if (longPressTimeoutRef.current) {
      const distance = gestureState.startPoint && newState.currentPoint
        ? getDistance(gestureState.startPoint, newState.currentPoint)
        : 0;
      
      if (distance > threshold) {
        window.clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
    }
  };
  
  // Handle touch end
  const handleTouchEnd = (event: React.TouchEvent) => {
    if (disabled || !gestureState.isGesturing) return;
    
    // Clear long press timeout
    if (longPressTimeoutRef.current) {
      window.clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    
    const now = Date.now();
    const points = getTouchPoints(event);
    
    // Final state update
    const newState: GestureState = {
      ...gestureState,
      isGesturing: false,
      isPinching: false,
      isRotating: false,
      isPanning: false
    };
    
    setGestureState(newState);
    
    // Call gesture end handlers
    if (!disablePan && onPanEnd) {
      onPanEnd(newState);
    }
    
    if (!disablePinch && onPinchEnd) {
      onPinchEnd(newState);
    }
    
    if (!disableRotate && onRotateEnd) {
      onRotateEnd(newState);
    }
    
    // Handle tap events
    if (
      gestureState.startPoint &&
      gestureState.currentPoint &&
      getDistance(gestureState.startPoint, gestureState.currentPoint) < threshold
    ) {
      // Check for double tap
      const timeSinceLastTap = now - lastTapTimeRef.current;
      
      if (!disableDoubleTap && timeSinceLastTap < doubleTapDelay) {
        if (onDoubleTap) {
          onDoubleTap(newState);
        }
        lastTapTimeRef.current = 0; // Reset to prevent triple tap
      } else {
        // Single tap
        if (!disableTap) {
          // Delay single tap to allow for double tap detection
          timeoutRef.current = window.setTimeout(() => {
            if (onTap) {
              onTap(newState);
            }
            timeoutRef.current = null;
          }, disableDoubleTap ? 0 : doubleTapDelay);
        }
        lastTapTimeRef.current = now;
      }
    }
    
    // Handle swipe
    if (!disableSwipe && onSwipe && newState.direction) {
      const velocity = Math.sqrt(
        Math.pow(newState.velocityX, 2) + Math.pow(newState.velocityY, 2)
      );
      
      if (velocity > swipeVelocityThreshold) {
        onSwipe(newState);
      }
    }
  };
  
  // Build class names
  let classNames = 'gesture-handler no-select';
  
  if (className) {
    classNames += ` ${className}`;
  }
  
  return (
    <Component
      ref={elementRef}
      className={classNames}
      style={{
        ...style,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
    </Component>
  );
};

export default GestureHandler;
