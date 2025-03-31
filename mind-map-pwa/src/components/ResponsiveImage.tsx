// src/components/ResponsiveImage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';
import { useResponsive } from '../contexts/ResponsiveContext';

interface ResponsiveImageProps {
  src: string;
  lowResSrc?: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  lowResSrc,
  alt,
  width = '100%',
  height = 'auto',
  className,
  style
}) => {
  const { shouldReduceImageQuality, network, power } = useResponsive();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Determine which image source to use
    const selectedSrc = shouldReduceImageQuality && lowResSrc ? lowResSrc : src;
    
    // Reset states when src changes
    setLoading(true);
    setError(false);
    
    // Create a new image to preload
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(selectedSrc);
      setLoading(false);
    };
    
    img.onerror = () => {
      // If high-res fails and we have a low-res, try that
      if (selectedSrc === src && lowResSrc) {
        const lowResImg = new Image();
        lowResImg.onload = () => {
          setImageSrc(lowResSrc);
          setLoading(false);
        };
        lowResImg.onerror = () => {
          setError(true);
          setLoading(false);
        };
        lowResImg.src = lowResSrc;
      } else {
        setError(true);
        setLoading(false);
      }
    };
    
    // If offline and we have a low-res version, use that directly
    if (!network.online && lowResSrc) {
      img.src = lowResSrc;
    } else {
      img.src = selectedSrc;
    }
    
    // Add loading attribute for browsers that support it
    if ('loading' in HTMLImageElement.prototype) {
      img.loading = 'lazy';
    }
    
    // Add fetchpriority attribute for browsers that support it
    if ('fetchPriority' in HTMLImageElement.prototype) {
      (img as any).fetchPriority = power.isLowPowerMode ? 'low' : 'auto';
    }
    
    return () => {
      // Cancel image loading if component unmounts
      img.onload = null;
      img.onerror = null;
    };
  }, [src, lowResSrc, shouldReduceImageQuality, network.online, power.isLowPowerMode]);

  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        width={width}
        height={height}
        animation={power.isLowPowerMode ? false : 'pulse'}
      />
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.disabledBackground',
          color: 'text.secondary',
          fontSize: 'small'
        }}
      >
        {alt || 'Image failed to load'}
      </Box>
    );
  }

  return (
    <img
      src={imageSrc || ''}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{
        objectFit: 'cover',
        ...style
      }}
    />
  );
};

export default ResponsiveImage;
