// src/contexts/ResponsiveContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import useViewportAdaptation, { ViewportConfig } from '../hooks/useViewportAdaptation';
import useNetworkStatus, { NetworkStatus } from '../hooks/useNetworkStatus';
import useDeviceMemory, { MemoryStatus } from '../hooks/useDeviceMemory';
import useFoldableDisplay, { FoldableDisplayStatus } from '../hooks/useFoldableDisplay';
import usePowerMode, { PowerModeStatus } from '../hooks/usePowerMode';

export interface ResponsiveContextProps {
  viewport: ViewportConfig;
  network: NetworkStatus;
  memory: MemoryStatus;
  foldable: FoldableDisplayStatus;
  power: PowerModeStatus;
  // Derived properties for easier usage
  shouldReduceAnimations: boolean;
  shouldVirtualizeList: boolean;
  shouldReduceImageQuality: boolean;
  shouldUseOfflineFirst: boolean;
}

const ResponsiveContext = createContext<ResponsiveContextProps | undefined>(undefined);

export const ResponsiveContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const viewport = useViewportAdaptation();
  const network = useNetworkStatus();
  const memory = useDeviceMemory();
  const foldable = useFoldableDisplay();
  const power = usePowerMode();

  // Derived properties based on device capabilities
  const shouldReduceAnimations = 
    power.isLowPowerMode || 
    power.reducedMotion || 
    memory.lowMemoryMode;

  const shouldVirtualizeList = 
    viewport.isMobile || 
    memory.lowMemoryMode || 
    (network.effectiveType && network.effectiveType !== '4g');

  const shouldReduceImageQuality = 
    network.saveData || 
    power.isLowPowerMode || 
    (network.effectiveType && network.effectiveType !== '4g');

  const shouldUseOfflineFirst = 
    !network.online || 
    (network.effectiveType && network.effectiveType !== '4g') ||
    network.saveData;

  const value: ResponsiveContextProps = {
    viewport,
    network,
    memory,
    foldable,
    power,
    shouldReduceAnimations,
    shouldVirtualizeList,
    shouldReduceImageQuality,
    shouldUseOfflineFirst
  };

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useResponsive = (): ResponsiveContextProps => {
  const context = useContext(ResponsiveContext);
  if (context === undefined) {
    throw new Error('useResponsive must be used within a ResponsiveContextProvider');
  }
  return context;
};

export default ResponsiveContext;
