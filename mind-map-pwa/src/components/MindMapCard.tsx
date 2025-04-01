// src/components/MindMapCard.tsx
import React, { memo } from 'react';
import { Card, CardContent } from '@mui/material';
import { useResponsive } from '../contexts/ResponsiveContext';
import ContainerQuery from './layout/ContainerQuery';
import { Heading4, Paragraph } from './typography/FluidTypography';
import TouchFriendly from './touch/TouchFriendly';
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
    <ContainerQuery type="card">
      <TouchFriendly
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        ariaLabel={onClick ? `Select ${title}` : undefined}
      >
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
            // Touch-friendly tap target
            minHeight: { xs: '80px', sm: '100px' }
          }}
          draggable={draggable}
        >
          <CardContent className="card-content">
            <Heading4 className="card-title" style={{ wordBreak: 'break-word' }}>
              {title}
            </Heading4>
            {description && (
              <Paragraph
                size="sm"
                className="card-body"
                style={{
                  color: 'text.secondary',
                  marginTop: '8px',
                  wordBreak: 'break-word'
                }}
              >
                {description}
              </Paragraph>
            )}
          </CardContent>
        </Card>
      </TouchFriendly>
    </ContainerQuery>
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
