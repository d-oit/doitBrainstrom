// src/components/accessibility/AccessibilitySettings.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Switch,
  FormControlLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Slider,
  Select,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Close,
  Accessibility,
  Contrast,
  TextFields,
  Keyboard,
  VisibilityOff,
  Speed,
  ColorLens,
  Info,
  RestartAlt
} from '@mui/icons-material';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { useI18n } from '../../contexts/I18nContext';

interface AccessibilitySettingsProps {
  open: boolean;
  onClose: () => void;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ open, onClose }) => {
  const { t } = useI18n();
  const { settings, updateSettings, isReducedMotionActive } = useAccessibility();
  const { mode, setMode } = useAppTheme();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeTab, setActiveTab] = useState(0);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle settings changes
  const handleToggleScreenReaderSupport = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ screenReaderSupport: event.target.checked });
  };
  
  const handleToggleKeyboardNavigation = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ keyboardNavigation: event.target.checked });
  };
  
  const handleToggleHighContrast = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ highContrast: event.target.checked });
    if (event.target.checked) {
      setMode('high-contrast');
    } else if (mode === 'high-contrast') {
      setMode('light');
    }
  };
  
  const handleToggleReducedMotion = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ reducedMotion: event.target.checked });
  };
  
  const handleToggleLargeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ largeText: event.target.checked });
  };
  
  const handleColorBlindnessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ colorBlindnessType: event.target.value as any });
  };
  
  // Reset all settings to defaults
  const handleResetSettings = () => {
    updateSettings({
      screenReaderSupport: true,
      keyboardNavigation: true,
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      colorBlindnessType: 'none'
    });
    
    if (mode === 'high-contrast') {
      setMode('light');
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      aria-labelledby="accessibility-settings-title"
    >
      <DialogTitle id="accessibility-settings-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Accessibility sx={{ mr: 1 }} />
            <Typography variant="h6" component="span">
              {t('accessibility.settings')}
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
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label={t('accessibility.settingsCategories')}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={t('accessibility.visualSettings')} 
            id="tab-0" 
            aria-controls="tabpanel-0"
            icon={<ColorLens />}
            iconPosition="start"
          />
          <Tab 
            label={t('accessibility.motionSettings')} 
            id="tab-1" 
            aria-controls="tabpanel-1"
            icon={<Speed />}
            iconPosition="start"
          />
          <Tab 
            label={t('accessibility.screenReaderSettings')} 
            id="tab-2" 
            aria-controls="tabpanel-2"
            icon={<VisibilityOff />}
            iconPosition="start"
          />
          <Tab 
            label={t('accessibility.keyboardSettings')} 
            id="tab-3" 
            aria-controls="tabpanel-3"
            icon={<Keyboard />}
            iconPosition="start"
          />
        </Tabs>
      </Box>
      
      <Divider />
      
      <DialogContent>
        {/* Visual Settings */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 0}
          id="tabpanel-0"
          aria-labelledby="tab-0"
        >
          {activeTab === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                {t('accessibility.contrastSettings')}
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.highContrast || mode === 'high-contrast'}
                    onChange={handleToggleHighContrast}
                    color="primary"
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    <Contrast sx={{ mr: 1 }} />
                    {t('accessibility.highContrastMode')}
                    <Tooltip title={t('accessibility.highContrastModeDescription')}>
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('accessibility.textSettings')}
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.largeText}
                      onChange={handleToggleLargeText}
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      <TextFields sx={{ mr: 1 }} />
                      {t('accessibility.largeText')}
                      <Tooltip title={t('accessibility.largeTextDescription')}>
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('accessibility.colorBlindnessSettings')}
                </Typography>
                
                <FormControl component="fieldset">
                  <RadioGroup
                    aria-label="color blindness type"
                    name="colorBlindnessType"
                    value={settings.colorBlindnessType}
                    onChange={handleColorBlindnessChange}
                  >
                    <FormControlLabel
                      value="none"
                      control={<Radio />}
                      label={t('accessibility.colorBlindness.none')}
                    />
                    <FormControlLabel
                      value="protanopia"
                      control={<Radio />}
                      label={t('accessibility.colorBlindness.protanopia')}
                    />
                    <FormControlLabel
                      value="deuteranopia"
                      control={<Radio />}
                      label={t('accessibility.colorBlindness.deuteranopia')}
                    />
                    <FormControlLabel
                      value="tritanopia"
                      control={<Radio />}
                      label={t('accessibility.colorBlindness.tritanopia')}
                    />
                    <FormControlLabel
                      value="achromatopsia"
                      control={<Radio />}
                      label={t('accessibility.colorBlindness.achromatopsia')}
                    />
                  </RadioGroup>
                </FormControl>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('accessibility.colorBlindnessPreview')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Paper
                      sx={{
                        width: 100,
                        height: 50,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="body2" color="primary.contrastText">
                        {t('common.primary')}
                      </Typography>
                    </Paper>
                    
                    <Paper
                      sx={{
                        width: 100,
                        height: 50,
                        bgcolor: 'secondary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="body2" color="secondary.contrastText">
                        {t('common.secondary')}
                      </Typography>
                    </Paper>
                    
                    <Paper
                      sx={{
                        width: 100,
                        height: 50,
                        bgcolor: 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="body2" color="error.contrastText">
                        {t('common.error')}
                      </Typography>
                    </Paper>
                    
                    <Paper
                      sx={{
                        width: 100,
                        height: 50,
                        bgcolor: 'warning.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="body2" color="warning.contrastText">
                        {t('common.warning')}
                      </Typography>
                    </Paper>
                    
                    <Paper
                      sx={{
                        width: 100,
                        height: 50,
                        bgcolor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="body2" color="success.contrastText">
                        {t('common.success')}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>
        
        {/* Motion Settings */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 1}
          id="tabpanel-1"
          aria-labelledby="tab-1"
        >
          {activeTab === 1 && (
            <>
              <Typography variant="h6" gutterBottom>
                {t('accessibility.motionSettings')}
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.reducedMotion || isReducedMotionActive}
                    onChange={handleToggleReducedMotion}
                    color="primary"
                    disabled={isReducedMotionActive && !settings.reducedMotion}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    <Speed sx={{ mr: 1 }} />
                    {t('accessibility.reducedMotion')}
                    <Tooltip title={t('accessibility.reducedMotionDescription')}>
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
              
              {isReducedMotionActive && !settings.reducedMotion && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
                  {t('accessibility.reducedMotionSystemEnabled')}
                </Typography>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('accessibility.animationSpeed')}
                </Typography>
                
                <Box sx={{ px: 2 }}>
                  <Slider
                    disabled={isReducedMotionActive}
                    aria-label={t('accessibility.animationSpeed')}
                    defaultValue={1}
                    step={0.1}
                    marks
                    min={0.5}
                    max={2}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}x`}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('accessibility.slower')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('accessibility.faster')}
                    </Typography>
                  </Box>
                </Box>
                
                {isReducedMotionActive && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {t('accessibility.animationSpeedDisabled')}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Box>
        
        {/* Screen Reader Settings */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 2}
          id="tabpanel-2"
          aria-labelledby="tab-2"
        >
          {activeTab === 2 && (
            <>
              <Typography variant="h6" gutterBottom>
                {t('accessibility.screenReaderSettings')}
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.screenReaderSupport}
                    onChange={handleToggleScreenReaderSupport}
                    color="primary"
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    <VisibilityOff sx={{ mr: 1 }} />
                    {t('accessibility.screenReaderSupport')}
                    <Tooltip title={t('accessibility.screenReaderSupportDescription')}>
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('accessibility.announcementVerbosity')}
                </Typography>
                
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <Select
                    value="medium"
                    disabled={!settings.screenReaderSupport}
                  >
                    <MenuItem value="low">{t('accessibility.verbosity.low')}</MenuItem>
                    <MenuItem value="medium">{t('accessibility.verbosity.medium')}</MenuItem>
                    <MenuItem value="high">{t('accessibility.verbosity.high')}</MenuItem>
                  </Select>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('accessibility.verbosityDescription')}
                </Typography>
              </Box>
            </>
          )}
        </Box>
        
        {/* Keyboard Settings */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 3}
          id="tabpanel-3"
          aria-labelledby="tab-3"
        >
          {activeTab === 3 && (
            <>
              <Typography variant="h6" gutterBottom>
                {t('accessibility.keyboardSettings')}
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.keyboardNavigation}
                    onChange={handleToggleKeyboardNavigation}
                    color="primary"
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    <Keyboard sx={{ mr: 1 }} />
                    {t('accessibility.keyboardNavigation')}
                    <Tooltip title={t('accessibility.keyboardNavigationDescription')}>
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={!settings.keyboardNavigation}
                  startIcon={<Keyboard />}
                >
                  {t('accessibility.customizeKeyboardShortcuts')}
                </Button>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('accessibility.customizeKeyboardShortcutsDescription')}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions>
        <Button
          startIcon={<RestartAlt />}
          color="secondary"
          onClick={handleResetSettings}
          sx={{ mr: 'auto' }}
        >
          {t('accessibility.resetSettings')}
        </Button>
        <Button onClick={onClose} color="primary">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccessibilitySettings;
