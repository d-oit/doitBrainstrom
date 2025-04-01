// src/components/accessibility/KeyboardShortcutsHelp.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close,
  Search,
  Keyboard,
  Clear,
  Settings,
  Edit
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useI18n } from '../../contexts/I18nContext';
import { focusManager } from '../../utils/accessibility/focusManager';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ open, onClose }) => {
  const { t } = useI18n();
  const { keyboardShortcuts, formatShortcut, getShortcutsByGroup } = useAccessibility();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [filteredShortcuts, setFilteredShortcuts] = useState<Record<string, any[]>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Get shortcuts grouped by category
  const shortcutsByGroup = getShortcutsByGroup();
  
  // Filter shortcuts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredShortcuts(shortcutsByGroup);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, any[]> = {};
    
    Object.entries(shortcutsByGroup).forEach(([group, shortcuts]) => {
      const matchingShortcuts = shortcuts.filter(shortcut => 
        shortcut.description.toLowerCase().includes(query) ||
        formatShortcut(shortcut).toLowerCase().includes(query) ||
        (shortcut.action && shortcut.action.toLowerCase().includes(query))
      );
      
      if (matchingShortcuts.length > 0) {
        filtered[group] = matchingShortcuts;
      }
    });
    
    setFilteredShortcuts(filtered);
  }, [searchQuery, shortcutsByGroup, formatShortcut]);
  
  // Focus the dialog when it opens
  useEffect(() => {
    if (open && dialogRef.current) {
      setTimeout(() => {
        focusManager.focusFirstElement(dialogRef.current as HTMLElement);
      }, 100);
    }
  }, [open]);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // Get the groups to display based on the active tab
  const getGroupsToDisplay = () => {
    const groups = Object.keys(filteredShortcuts);
    
    if (activeTab === 0) {
      // All shortcuts
      return groups;
    } else if (activeTab === 1) {
      // Global shortcuts
      return groups.filter(group => group === 'Global' || group === 'Navigation');
    } else if (activeTab === 2) {
      // Mind Map shortcuts
      return groups.filter(group => group === 'Mind Map');
    } else {
      // Other shortcuts
      return groups.filter(group => 
        group !== 'Global' && 
        group !== 'Navigation' && 
        group !== 'Mind Map'
      );
    }
  };
  
  const groupsToDisplay = getGroupsToDisplay();
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      aria-labelledby="keyboard-shortcuts-title"
      ref={dialogRef}
    >
      <DialogTitle id="keyboard-shortcuts-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Keyboard sx={{ mr: 1 }} />
            <Typography variant="h6" component="span">
              {t('accessibility.keyboardShortcuts')}
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Box sx={{ px: 3, pb: 1 }}>
        <TextField
          fullWidth
          placeholder={t('common.search')}
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label={t('common.clear')}
                  onClick={handleClearSearch}
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          aria-label={t('common.search')}
        />
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label={t('accessibility.shortcutCategories')}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t('accessibility.allShortcuts')} id="tab-0" aria-controls="tabpanel-0" />
          <Tab label={t('accessibility.globalShortcuts')} id="tab-1" aria-controls="tabpanel-1" />
          <Tab label={t('accessibility.mindMapShortcuts')} id="tab-2" aria-controls="tabpanel-2" />
          <Tab label={t('accessibility.otherShortcuts')} id="tab-3" aria-controls="tabpanel-3" />
        </Tabs>
      </Box>
      
      <Divider />
      
      <DialogContent>
        {groupsToDisplay.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {t('accessibility.noShortcutsFound')}
            </Typography>
          </Box>
        ) : (
          groupsToDisplay.map(group => (
            <Box key={group} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t(`accessibility.group.${group.toLowerCase()}`, { defaultValue: group })}
              </Typography>
              
              <List dense>
                {filteredShortcuts[group].map((shortcut, index) => (
                  <ListItem
                    key={`${group}-${index}`}
                    secondaryAction={
                      <Box
                        sx={{
                          display: 'inline-block',
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {formatShortcut(shortcut)}
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={shortcut.description}
                      primaryTypographyProps={{
                        variant: 'body2'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ))
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions>
        <Button
          startIcon={<Settings />}
          color="primary"
          sx={{ mr: 'auto' }}
        >
          {t('accessibility.customizeShortcuts')}
        </Button>
        <Button onClick={onClose} color="primary">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;
