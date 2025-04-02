// src/components/Demo/ThemeDemo.tsx
import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import ModernAppBar from '../Navigation/AppBar';
import MindMapNode from '../MindMap/MindMapNode';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';

export default function ThemeDemo() {
  const { mode, settings } = useAppTheme();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ModernAppBar title="Theme System Demo" />
      
      <Box sx={{ p: 3, flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Modern UI with Accessibility
        </Typography>
        
        <Typography variant="body1" paragraph>
          Current theme mode: <strong>{mode}</strong> | 
          Reduced motion: <strong>{settings.reducedMotion ? 'Yes' : 'No'}</strong> | 
          Color scheme: <strong>{settings.colorScheme}</strong>
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Gradient Buttons
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" color="primary">
                  Primary Button
                </Button>
                <Button variant="contained" color="secondary">
                  Secondary Button
                </Button>
                <Button variant="outlined" color="primary">
                  Outlined Button
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Mind Map Nodes
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <MindMapNode 
                  id="node1" 
                  title="Root Node" 
                  description="This is a root node with gradient background"
                  isRoot={true}
                />
                
                <MindMapNode 
                  id="node2" 
                  title="Regular Node" 
                  description="This is a regular node"
                />
                
                <MindMapNode 
                  id="node3" 
                  title="Selected Node" 
                  description="This node is selected"
                  isSelected={true}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
