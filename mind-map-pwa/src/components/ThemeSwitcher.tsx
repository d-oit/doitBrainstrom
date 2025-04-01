// src/components/ThemeSwitcher.tsx
import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  SettingsBrightness,
  Contrast,
  SettingsOutlined,
  AccessibilityNew
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { ThemeMode, ThemeSettings } from '../types/theme';

const ThemeSwitcher: React.FC = () => {
  const { mode, setMode, useCssVars, setUseCssVars, settings, updateSettings } = useTheme();
  const { t } = useI18n();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    handleClose();
  };

  const handleAdvancedSettingsOpen = () => {
    setShowAdvancedSettings(true);
    handleClose();
  };

  const handleAdvancedSettingsClose = () => {
    setShowAdvancedSettings(false);
  };

  const handleColorSchemeChange = (scheme: ThemeSettings['colorScheme']) => {
    updateSettings({ colorScheme: scheme });
  };

  const getThemeIcon = () => {
    if (mode === 'system') return <SettingsBrightness />;
    if (mode === 'dark') return <Brightness4 />;
    if (mode === 'high-contrast') return <Contrast />;
    return <Brightness7 />;
  };

  // Theme preview cards for the advanced settings dialog
  const ThemePreviewCard = ({ themeMode, label }: { themeMode: ThemeMode, label: string }) => {
    const isSelected = mode === themeMode;
    const bgColor = themeMode === 'light' ? '#ffffff' :
                   themeMode === 'dark' ? '#121212' :
                   themeMode === 'high-contrast' ? '#000000' :
                   '#f5f5f5';
    const textColor = themeMode === 'light' ? '#000000' :
                     themeMode === 'dark' ? '#ffffff' :
                     themeMode === 'high-contrast' ? '#ffffff' :
                     '#000000';
    const accentColor = themeMode === 'light' ? '#1976d2' :
                       themeMode === 'dark' ? '#90caf9' :
                       themeMode === 'high-contrast' ? '#ffff00' :
                       '#1976d2';

    return (
      <Card
        sx={{
          border: isSelected ? `2px solid ${accentColor}` : '2px solid transparent',
          height: '100%',
          minHeight: 120
        }}
      >
        <CardActionArea
          onClick={() => handleThemeChange(themeMode)}
          sx={{
            height: '100%',
            backgroundColor: bgColor,
            color: textColor,
            p: 1
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: isSelected ? 'bold' : 'normal' }}>
              {label}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: accentColor,
                mr: 1
              }} />
              <Typography variant="body2" sx={{ color: textColor }}>
                {t('theme.accent')}
              </Typography>
            </Box>
            <Box sx={{
              mt: 1,
              height: 8,
              width: '100%',
              backgroundColor: accentColor,
              borderRadius: 4
            }} />
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  return (
    <div>
      <Tooltip title={t('theme.change')}>
        <IconButton
          onClick={handleClick}
          size="large"
          color="inherit"
          aria-label={t('theme.change')}
        >
          {getThemeIcon()}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem onClick={() => handleThemeChange('system')}>
          <SettingsBrightness sx={{ mr: 1 }} />
          {t('theme.system')}
        </MenuItem>
        <MenuItem onClick={() => handleThemeChange('light')}>
          <Brightness7 sx={{ mr: 1 }} />
          {t('theme.light')}
        </MenuItem>
        <MenuItem onClick={() => handleThemeChange('dark')}>
          <Brightness4 sx={{ mr: 1 }} />
          {t('theme.dark')}
        </MenuItem>
        <MenuItem onClick={() => handleThemeChange('high-contrast')}>
          <Contrast sx={{ mr: 1 }} />
          {t('theme.highContrast')}
        </MenuItem>
        <Divider />
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={useCssVars}
                onChange={(e) => setUseCssVars(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={t('theme.useCssVars')}
          />
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                color="primary"
                size="small"
              />
            }
            label={t('theme.reducedMotion')}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleAdvancedSettingsOpen}>
          <SettingsOutlined sx={{ mr: 1 }} />
          {t('theme.advancedSettings')}
        </MenuItem>
      </Menu>

      {/* Advanced Theme Settings Dialog */}
      <Dialog
        open={showAdvancedSettings}
        onClose={handleAdvancedSettingsClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('theme.advancedSettings')}</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {t('theme.themePreview')}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <ThemePreviewCard themeMode="system" label={t('theme.system')} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ThemePreviewCard themeMode="light" label={t('theme.light')} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ThemePreviewCard themeMode="dark" label={t('theme.dark')} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ThemePreviewCard themeMode="high-contrast" label={t('theme.highContrast')} />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom>
            {t('theme.accessibilitySettings')}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccessibilityNew sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              {t('theme.colorBlindnessSupport')}
            </Typography>
          </Box>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">{t('theme.colorScheme')}</FormLabel>
            <RadioGroup
              row
              value={settings.colorScheme}
              onChange={(e) => handleColorSchemeChange(e.target.value as ThemeSettings['colorScheme'])}
            >
              <FormControlLabel value="default" control={<Radio />} label={t('theme.colorScheme.default')} />
              <FormControlLabel value="protanopia" control={<Radio />} label={t('theme.colorScheme.protanopia')} />
              <FormControlLabel value="deuteranopia" control={<Radio />} label={t('theme.colorScheme.deuteranopia')} />
              <FormControlLabel value="tritanopia" control={<Radio />} label={t('theme.colorScheme.tritanopia')} />
              <FormControlLabel value="achromatopsia" control={<Radio />} label={t('theme.colorScheme.achromatopsia')} />
            </RadioGroup>
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.animations}
                  onChange={(e) => updateSettings({ animations: e.target.checked })}
                  color="primary"
                />
              }
              label={t('theme.enableAnimations')}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                  color="primary"
                />
              }
              label={t('theme.reducedMotion')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAdvancedSettingsClose}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ThemeSwitcher;
