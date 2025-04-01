// src/components/MindMapCard.tsx
import React, { memo } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { useResponsive } from '../contexts/ResponsiveContext';
import '../styles/responsive.css';

interface MindMapCardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  draggable?: boolean;
}

const MindMapCard: React.FC<MindMapCardProps> = ({
  title,
  description,
  onClick,
  draggable = false
}) => {
  // We only need the shouldReduceAnimations from the responsive context
  const { shouldReduceAnimations } = useResponsive();

  return (
    <Card
      className="mind-map-card"
      sx={{
        minWidth: { xs: 150, sm: 180, md: 200 },
        maxWidth: { xs: 200, sm: 250, md: 300 },
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: shouldReduceAnimations ? 'none' : 'all 0.2s ease-in-out',
        '&:hover': {
          transform: shouldReduceAnimations ? 'none' : 'scale(1.02)',
          boxShadow: 3
        },
        '& .MuiCardContent-root': {
          padding: { xs: '12px', sm: '16px' }
        },
        // Touch-friendly tap target
        minHeight: { xs: '80px', sm: '100px' }
      }}
      onClick={onClick}
      draggable={draggable}
      // Improve accessibility
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Select ${title}` : undefined}
    >
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontSize: { xs: '16px', sm: '18px', md: '20px' },
            fontWeight: 'medium',
            wordBreak: 'break-word'
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              fontSize: { xs: '12px', sm: '14px' },
              wordBreak: 'break-word'
            }}
          >
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(MindMapCard, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  // Only re-render if these props change
  return (
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.draggable === nextProps.draggable
  );
});
