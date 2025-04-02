// src/components/Navigation/AppBar.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, useTheme } from '@mui/material';
import { Brightness4, Brightness7, SettingsBrightness, Contrast } from '@mui/icons-material';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';

interface ModernAppBarProps {
  title?: string;
  children?: React.ReactNode;
}

export default function ModernAppBar({ title = 'BrainSpark', children }: ModernAppBarProps) {
  const theme = useTheme();
  const { mode, setMode, isHighContrastMode, settings } = useAppTheme();
  const reducedMotion = settings?.reducedMotion || false;
  
  const handleThemeToggle = () => {
    if (mode === 'light') setMode('dark');
    else if (mode === 'dark') setMode('high-contrast');
    else setMode('light');
  };
  
  const getThemeIcon = () => {
    if (mode === 'system') return <SettingsBrightness />;
    if (mode === 'dark') return <Brightness4 />;
    if (mode === 'high-contrast') return <Contrast />;
    return <Brightness7 />;
  };
  
  return (
    <AppBar 
      position="sticky"
      sx={{
        background: isHighContrastMode 
          ? '#000000' 
          : theme.palette.gradient?.primary || theme.palette.primary.main,
        backdropFilter: 'blur(12px)',
        boxShadow: 'none',
        borderBottom: isHighContrastMode ? '2px solid #ffffff' : 'none'
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            color: isHighContrastMode ? '#ffffff' : 'inherit'
          }}
        >
          {title}
        </Typography>
        
        {children}
        
        <IconButton 
          onClick={handleThemeToggle}
          color="inherit"
          aria-label="Toggle theme mode"
          sx={{ 
            position: 'relative',
            overflow: 'hidden',
            transition: reducedMotion ? 'none' : theme.transitions.create(['transform']),
            '&:hover': {
              transform: reducedMotion ? 'none' : 'scale(1.1)'
            },
            ...(isHighContrastMode && {
              border: '2px solid #ffffff',
              margin: '0 8px'
            })
          }}
        >
          {getThemeIcon()}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
