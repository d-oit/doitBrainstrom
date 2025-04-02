# Navigation System Overhaul Plan

## Core Architecture Updates

### 1. Responsive Breakpoints (Updated)
```ts
// src/styles/breakpoints.ts
export const breakpoints = {
  mobile: {
    min: 0,
    max: 599.98,      // Reduced from 767.98px for better mobile support
    menu: '320px'     // Fixed menu width for mobile
  },
  tablet: {
    min: 600,
    max: 959.98,
    menu: '400px'     // Wider menu for tablets
  },
  desktop: {
    min: 960,
    menu: '100%'      // Full width for desktop nav
  }
};
```

### 2. Navigation Components
```tsx
// src/components/navigation/MainNav.tsx
export default function MainNav() {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.mobile.max}px)`);
  const isTablet = useMediaQuery(`(max-width: ${breakpoints.tablet.max}px)`);
  
  return (
    <AppBar position="sticky" sx={{ background: theme.palette.gradient.primary }}>
      <Toolbar>
        <GradientText variant="h6" sx={{ flexGrow: 1 }}>
          {t('app.title')}
        </GradientText>
        {isMobile ? <MobileMenu /> : isTablet ? <TabletMenu /> : <DesktopMenu />}
      </Toolbar>
    </AppBar>
  );
}
```

### 3. Mobile Menu (Optimized Width)
```tsx
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();
  const theme = useTheme();

  return (
    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
      <IconButton 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('nav.menu')}
        sx={{ p: 1 }}
      >
        <MenuIcon sx={{ fontSize: 24 }} /> {/* Reduced from 28px */}
      </IconButton>

      <Collapse 
        in={isOpen} 
        timeout={300}
      >
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',    // Changed from absolute
            top: '56px',         // Reduced from 64px
            right: 0,            // Right-aligned
            width: breakpoints.mobile.menu,
            maxWidth: '100%',    // Prevents overflow
            height: 'calc(100vh - 56px)',
            overflowY: 'auto',
            background: theme.palette.gradient.surface,
            borderRadius: '16px 0 0 0'
          }}
        >
          <VirtualizedList
            items={navItems}
            itemHeight={48}      // Reduced from 56px
            renderItem={(item) => (
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  minHeight: 48,
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  '&:hover': {
                    background: 'rgba(99, 102, 241, 0.08)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={t(item.label)}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { fontWeight: 500 }
                  }}
                />
              </ListItemButton>
            )}
          />
        </Paper>
      </Collapse>
    </Box>
  );
}
```

## Testing Matrix (Updated)

### Mobile Breakpoints
- **Small Mobile**: 320px - 375px
- **Medium Mobile**: 376px - 599px
- **Tablet**: 600px - 959px
- **Desktop**: ≥960px

### Device Testing
```
Small Mobile:
- iPhone SE (320px)
- Galaxy Fold (280px when folded)

Medium Mobile:
- iPhone 12/13 (390px)
- Pixel 5 (393px)

Tablet:
- iPad Mini (768px)
- Surface Pro (912px)
```

### Key Validation Points
1. **Menu Width**
   - [ ] Never exceeds screen width on any device
   - [ ] Fixed 320px width on mobile is comfortable
   - [ ] Content remains readable at all sizes
   - [ ] No horizontal scrolling occurs

2. **Touch Targets**
   - [ ] Menu items maintain 48px height
   - [ ] Icons and text remain properly spaced
   - [ ] Touch areas don't overlap

3. **Performance**
   - [ ] Smooth animation on low-end devices
   - [ ] No layout shifts during open/close
   - [ ] Virtual list renders efficiently

## Success Metrics (Updated)
- Zero horizontal scrolling instances
- Touch targets consistently ≥48px
- Layout shift score <0.1
- 60fps animations even on low-end devices
- 100% test coverage across device matrix
