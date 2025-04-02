# Sidebar Navigation System

This document explains the sidebar navigation system implemented in the Mind Map PWA application.

## Overview

The sidebar navigation system provides a persistent vertical navigation panel that spans from the header to the footer of the application. It offers different behaviors based on the device size:

- **Mobile**: The sidebar is hidden by default and can be toggled with a menu button
- **Tablet/Desktop**: The sidebar is always visible but can be collapsed to show only icons

## Components

The sidebar navigation system consists of the following components:

1. **NavigationDrawer**: The main component that renders the sidebar
2. **NavigationLink**: Individual navigation items within the sidebar
3. **DrawerToggle**: Button to toggle the sidebar on mobile devices

## Features

### Responsive Design

- **Mobile (< 600px)**: Overlay mode - sidebar slides in from the left when toggled
- **Tablet (600px - 899px)**: Persistent sidebar with collapsible functionality
- **Desktop (≥ 900px)**: Persistent sidebar with collapsible functionality

### Accessibility

The sidebar is fully accessible with:

- Proper ARIA attributes for screen readers
- Keyboard navigation support
- Focus management
- Skip links for keyboard users

### Theming

The sidebar supports theming through CSS variables defined in `theme-variables.css`:

- Light theme
- Dark theme
- High-contrast theme (for accessibility)

## Usage

### Adding New Navigation Items

To add a new navigation item to the sidebar:

1. Open `NavigationDrawer.tsx`
2. Add a new item to the `drawer-nav-list` in the format:

```tsx
<li className="drawer-nav-item" role="none">
  <NavigationLink
    icon={<YourIcon />}
    label={t('your.translation.key')}
    active={currentTab === yourTabIndex}
    onClick={() => handleLinkClick(yourTabIndex)}
    ariaControls="tabpanel-yourTabIndex"
  />
</li>
```

### Customizing the Sidebar

The sidebar appearance can be customized by modifying the CSS variables in `theme-variables.css`:

```css
:root {
  --drawer-bg-color: #ffffff;
  --drawer-text-color: rgba(0, 0, 0, 0.87);
  --drawer-border-color: rgba(0, 0, 0, 0.12);
  --drawer-hover-color: rgba(0, 0, 0, 0.04);
  --drawer-active-color: rgba(33, 150, 243, 0.12);
  --drawer-focus-color: rgba(33, 150, 243, 0.5);
  --drawer-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  --drawer-scrollbar-track: rgba(0, 0, 0, 0.05);
  --drawer-scrollbar-thumb: rgba(0, 0, 0, 0.2);
}
```

## Implementation Details

### State Management

The sidebar uses two state variables:

1. `drawerOpen`: Controls whether the sidebar is open (primarily for mobile)
2. `drawerCollapsed`: Controls whether the sidebar is collapsed (for tablet/desktop)

These states are persisted in localStorage to maintain user preferences across sessions.

### Layout Integration

The sidebar is integrated with the main layout through CSS classes that adjust the main content area and footer based on the sidebar state:

- `drawer-open`: Applied when the sidebar is open
- `drawer-collapsed`: Applied when the sidebar is collapsed

This ensures proper spacing and layout across the application.
