// src/components/MindMapCard.tsx
import React from 'react';
import { Card, CardContent, Typography, useTheme, useMediaQuery } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Card
      className="mind-map-card"
      sx={{
        minWidth: isMobile ? 150 : isTablet ? 180 : 200,
        maxWidth: isMobile ? 200 : isTablet ? 250 : 300,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3
        },
        '& .MuiCardContent-root': {
          padding: isMobile ? '12px' : '16px'
        }
      }}
      onClick={onClick}
      draggable={draggable}
    >
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontSize: isMobile ? '16px' : isTablet ? '18px' : '20px',
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
              fontSize: isMobile ? '12px' : '14px',
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

export default MindMapCard;
