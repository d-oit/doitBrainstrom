// src/components/navigation/NavigationDrawer.tsx
import React, { useEffect, useRef } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MapIcon from '@mui/icons-material/Map';
import CloudIcon from '@mui/icons-material/Cloud';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PaletteIcon from '@mui/icons-material/Palette';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NavigationLink from './NavigationLink';
import '../../styles/drawer.css';

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  currentTab: number;
  onTabChange: (tabIndex: number) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  open,
  onClose,
  currentTab,
  onTabChange,
  collapsed = false,
  onToggleCollapse = () => {}
}) => {
  const { t } = useI18n();
  const { viewport } = useResponsive();
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation and accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && viewport.isMobile && open) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, viewport.isMobile]);

  // Handle focus management
  useEffect(() => {
    if (open && drawerRef.current) {
      // Find the first focusable element in the drawer
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [open]);

  // Prevent body scrolling when drawer is open on mobile
  useEffect(() => {
    if (viewport.isMobile) {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, viewport.isMobile]);

  const handleBackdropClick = () => {
    if (viewport.isMobile) {
      onClose();
    }
  };

  const handleLinkClick = (tabIndex: number) => {
    onTabChange(tabIndex);
    if (viewport.isMobile) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile overlay mode */}
      <div
        ref={backdropRef}
        className={`drawer-backdrop ${open && viewport.isMobile ? 'visible' : ''}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`drawer ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}
        role="navigation"
        aria-label={t('navigation.sidebarLabel')}
        id="navigation"
        aria-expanded={open}
        aria-hidden={!open && viewport.isMobile}
      >
        <div className="drawer-header">
          <h2 className="drawer-title">{t('navigation.title')}</h2>
          {viewport.isMobile ? (
            <IconButton
              className="drawer-close-button"
              aria-label={t('navigation.closeDrawer')}
              onClick={onClose}
              size="large"
              aria-controls="navigation"
            >
              <CloseIcon />
            </IconButton>
          ) : (
            <IconButton
              className="drawer-collapse-button"
              aria-label={collapsed ? t('navigation.expandDrawer') : t('navigation.collapseDrawer')}
              onClick={onToggleCollapse}
              size="large"
              aria-controls="navigation"
              aria-expanded={!collapsed}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          )}
        </div>

        <div className="drawer-content">
          <nav>
            <ul className="drawer-nav-list" role="menu" aria-label={t('navigation.mainMenu')}>
              <li className="drawer-nav-item" role="none">
                <NavigationLink
                  icon={<MapIcon />}
                  label={t('tabs.mindMap')}
                  active={currentTab === 0}
                  onClick={() => handleLinkClick(0)}
                  ariaControls="tabpanel-0"
                />
              </li>
              <li className="drawer-nav-item" role="none">
                <NavigationLink
                  icon={<CloudIcon />}
                  label={t('tabs.s3Connection')}
                  active={currentTab === 1}
                  onClick={() => handleLinkClick(1)}
                  ariaControls="tabpanel-1"
                />
              </li>
              <li className="drawer-nav-item" role="none">
                <NavigationLink
                  icon={<ViewModuleIcon />}
                  label={t('tabs.sampleCards')}
                  active={currentTab === 2}
                  onClick={() => handleLinkClick(2)}
                  ariaControls="tabpanel-2"
                />
              </li>
              <li className="drawer-nav-item" role="none">
                <NavigationLink
                  icon={<PaletteIcon />}
                  label="Theme Demo"
                  active={currentTab === 3}
                  onClick={() => handleLinkClick(3)}
                  ariaControls="tabpanel-3"
                />
              </li>
            </ul>
          </nav>
        </div>

        {/* Secondary actions at the bottom of the sidebar */}
        <Box className="drawer-footer">
          <ul className="drawer-nav-list" role="menu" aria-label={t('navigation.secondaryMenu')}>
            <li className="drawer-nav-item" role="none">
              <NavigationLink
                icon={<SettingsIcon />}
                label={t('common.settings')}
                active={false}
                onClick={() => {}}
              />
            </li>
            <li className="drawer-nav-item" role="none">
              <NavigationLink
                icon={<HelpOutlineIcon />}
                label={t('common.help')}
                active={false}
                onClick={() => {}}
              />
            </li>
          </ul>
        </Box>
      </div>
    </>
  );
};

export default NavigationDrawer;