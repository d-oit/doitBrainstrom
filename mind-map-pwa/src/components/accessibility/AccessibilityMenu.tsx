// src/components/accessibility/AccessibilityMenu.tsx
import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Switch,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Accessibility,
  Contrast,
  TextFields,
  Keyboard,
  VisibilityOff,
  Speed,
  Settings,
  HelpOutline
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useI18n } from '../../contexts/I18nContext';
import AccessibilitySettings from './AccessibilitySettings';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

/**
 * AccessibilityMenu component
 * Provides quick access to accessibility features and settings
 */
const AccessibilityMenu: React.FC = () => {
  const { t } = useI18n();
  const { 
    settings, 
    updateSettings, 
    isHighContrastActive,
    isReducedMotionActive,
    isLargeTextActive
  } = useAccessibility();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  
  const open = Boolean(anchorEl);
  
  // Count active accessibility features for badge
  const activeFeatures = [
    isHighContrastActive,
    isReducedMotionActive,
    isLargeTextActive,
    settings.screenReaderSupport
  ].filter(Boolean).length;
  
  // Handle menu open
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Toggle settings
  const handleToggleHighContrast = () => {
    updateSettings({ highContrast: !isHighContrastActive });
  };
  
  const handleToggleReducedMotion = () => {
    updateSettings({ reducedMotion: !isReducedMotionActive });
  };
  
  const handleToggleLargeText = () => {
    updateSettings({ largeText: !isLargeTextActive });
  };
  
  const handleToggleScreenReader = () => {
    updateSettings({ screenReaderSupport: !settings.screenReaderSupport });
  };
  
  // Open dialogs
  const handleOpenSettings = () => {
    setSettingsOpen(true);
    handleClose();
  };
  
  const handleOpenShortcuts = () => {
    setShortcutsOpen(true);
    handleClose();
  };
  
  return (
    <>
      <Tooltip title={t('accessibility.accessibilityFeatures')}>
        <IconButton
          onClick={handleClick}
          size="large"
          aria-label={t('accessibility.accessibilityFeatures')}
          aria-controls={open ? 'accessibility-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          color="inherit"
        >
          <Badge
            badgeContent={activeFeatures > 0 ? activeFeatures : undefined}
            color="secondary"
          >
            <Accessibility />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        id="accessibility-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'accessibility-button',
          dense: true
        }}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 250, maxWidth: 320 }
        }}
      >
        <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>
          {t('accessibility.accessibilityFeatures')}
        </Typography>
        
        <Divider />
        
        <MenuItem onClick={handleToggleHighContrast}>
          <ListItemIcon>
            <Contrast color={isHighContrastActive ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('accessibility.highContrastMode')} />
          <Switch
            edge="end"
            checked={isHighContrastActive}
            inputProps={{
              'aria-labelledby': 'high-contrast-mode-label'
            }}
          />
        </MenuItem>
        
        <MenuItem onClick={handleToggleReducedMotion}>
          <ListItemIcon>
            <Speed color={isReducedMotionActive ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('accessibility.reducedMotion')} />
          <Switch
            edge="end"
            checked={isReducedMotionActive}
            inputProps={{
              'aria-labelledby': 'reduced-motion-label'
            }}
          />
        </MenuItem>
        
        <MenuItem onClick={handleToggleLargeText}>
          <ListItemIcon>
            <TextFields color={isLargeTextActive ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('accessibility.largeText')} />
          <Switch
            edge="end"
            checked={isLargeTextActive}
            inputProps={{
              'aria-labelledby': 'large-text-label'
            }}
          />
        </MenuItem>
        
        <MenuItem onClick={handleToggleScreenReader}>
          <ListItemIcon>
            <VisibilityOff color={settings.screenReaderSupport ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('accessibility.screenReaderSupport')} />
          <Switch
            edge="end"
            checked={settings.screenReaderSupport}
            inputProps={{
              'aria-labelledby': 'screen-reader-support-label'
            }}
          />
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleOpenShortcuts}>
          <ListItemIcon>
            <Keyboard />
          </ListItemIcon>
          <ListItemText primary={t('accessibility.keyboardShortcuts')} />
        </MenuItem>
        
        <MenuItem onClick={handleOpenSettings}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary={t('accessibility.moreSettings')} />
        </MenuItem>
        
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <HelpOutline />
          </ListItemIcon>
          <ListItemText primary={t('accessibility.accessibilityHelp')} />
        </MenuItem>
      </Menu>
      
      <AccessibilitySettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      
      <KeyboardShortcutsHelp
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </>
  );
};

export default AccessibilityMenu;
