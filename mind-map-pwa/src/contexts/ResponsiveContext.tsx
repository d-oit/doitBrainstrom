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
    (power.isLowPowerMode || false) ||
    (power.reducedMotion || false) ||
    (memory.lowMemoryMode || false);

  const shouldVirtualizeList =
    viewport.isMobile ||
    (memory.lowMemoryMode || false) ||
    (network.effectiveType && network.effectiveType !== '4g');

  const shouldReduceImageQuality =
    (network.saveData || false) ||
    (power.isLowPowerMode || false) ||
    (network.effectiveType && network.effectiveType !== '4g');

  const shouldUseOfflineFirst =
    !(network.online || true) ||
    (network.effectiveType && network.effectiveType !== '4g') ||
    (network.saveData || false);

  // Cast to boolean to avoid null values
  const value: ResponsiveContextProps = {
    viewport,
    network,
    memory,
    foldable,
    power,
    shouldReduceAnimations: !!shouldReduceAnimations,
    shouldVirtualizeList: !!shouldVirtualizeList,
    shouldReduceImageQuality: !!shouldReduceImageQuality,
    shouldUseOfflineFirst: !!shouldUseOfflineFirst
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
