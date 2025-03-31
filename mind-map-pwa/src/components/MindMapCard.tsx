// src/components/MindMapCard.tsx
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

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
  return (
    <Card 
      sx={{ 
        minWidth: 200, 
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
      onClick={onClick}
      draggable={draggable}
    >
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default MindMapCard;
