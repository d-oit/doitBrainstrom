// src/components/MindMap/MindMapNode.tsx
import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';

interface MindMapNodeProps {
  id: string;
  title: string;
  description?: string;
  isRoot?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function MindMapNode({ 
  id, 
  title, 
  description,
  isRoot = false, 
  isSelected = false,
  onClick 
}: MindMapNodeProps) {
  const theme = useTheme();
  const { isHighContrastMode, settings } = useAppTheme();
  const reducedMotion = settings?.reducedMotion || false;
  
  return (
    <Paper
      elevation={isSelected ? 8 : 2}
      onClick={onClick}
      sx={{
        padding: theme.spacing(2),
        minWidth: 120,
        maxWidth: 200,
        cursor: 'pointer',
        transition: reducedMotion ? 'none' : theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.shorter
        }),
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        backgroundImage: isRoot 
          ? (isHighContrastMode ? 'none' : theme.palette.gradient?.primary || 'none')
          : (isHighContrastMode ? 'none' : theme.palette.gradient?.surface || 'none'),
        backgroundColor: isRoot 
          ? (isHighContrastMode ? '#000000' : 'transparent')
          : (isHighContrastMode ? '#121212' : 'transparent'),
        border: isHighContrastMode 
          ? `3px solid ${isSelected ? theme.palette.secondary.main : theme.palette.primary.main}`
          : isSelected 
            ? `2px solid ${theme.palette.primary.main}` 
            : '1px solid rgba(255, 255, 255, 0.1)',
        '&:hover': {
          transform: reducedMotion ? 'none' : isSelected ? 'scale(1.05)' : 'translateY(-4px)',
          boxShadow: theme.shadows[isSelected ? 12 : 6]
        }
      }}
      role="button"
      aria-pressed={isSelected}
    >
      <Typography 
        variant={isRoot ? "h6" : "body1"} 
        fontWeight={isRoot ? 600 : 400}
        color={isRoot && !isHighContrastMode ? "white" : "textPrimary"}
        gutterBottom
      >
        {title}
      </Typography>
      
      {description && (
        <Typography 
          variant="body2" 
          color={isRoot && !isHighContrastMode ? "rgba(255, 255, 255, 0.7)" : "textSecondary"}
        >
          {description}
        </Typography>
      )}
    </Paper>
  );
}
