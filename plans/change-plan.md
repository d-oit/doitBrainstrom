
## Complete Theme System Configuration  
```tsx  
// src/theme/theme.ts  
import { createTheme, responsiveFontSizes } from '@mui/material/styles'  

const baseTheme = (mode: 'light' | 'dark') => createTheme({  
  palette: {  
    mode,  
    primary: { main: mode === 'light' ? '#6366f1' : '#818cf8' },  
    secondary: { main: mode === 'light' ? '#10b981' : '#34d399' },  
    gradient: {  
      primary: mode === 'light'  
        ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'  
        : 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',  
      surface: mode === 'light'  
        ? 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'  
        : 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)'  
    },  
    background: {  
      default: mode === 'light' ? '#f8fafc' : '#0f172a',  
      paper: mode === 'light' ? '#ffffff' : '#1e293b',  
    },  
  },  
  shape: { borderRadius: 16 },  
  components: {  
    MuiButton: {  
      styleOverrides: {  
        root: {  
          backgroundImage: 'var(--gradient-primary)',  
          fontWeight: 600,  
          transition: 'transform 0.2s, box-shadow 0.2s',  
          '&:hover': {  
            transform: 'translateY(-2px)',  
            boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.3)'  
          }  
        }  
      }  
    },  
    MuiPaper: {  
      styleOverrides: {  
        root: {  
          backgroundImage: 'var(--gradient-surface)',  
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',  
          border: '1px solid rgba(255, 255, 255, 0.1)'  
        }  
      }  
    }  
  }  
})  

export const createAppTheme = (mode: 'light' | 'dark') =>  
  responsiveFontSizes(baseTheme(mode))  
```  

## Theme Provider Implementation  
```tsx  
// src/providers/ThemeProvider.tsx  
import { useState, useMemo } from 'react'  
import { ThemeProvider, CssBaseline } from '@mui/material'  
import { createAppTheme } from '../theme/theme'  

export default function AppThemeProvider({ children }) {  
  const [mode, setMode] = useState<'light' | 'dark'>('light')  
  const theme = useMemo(() => createAppTheme(mode), [mode])  

  return (  
    <ThemeProvider theme={theme}>  
      <CssBaseline />  
      {children}  
    </ThemeProvider>  
  )  
}  
```  

## Modern UI Components  

### Gradient Navigation Bar  
```tsx  
// src/components/Navigation/AppBar.tsx  
export default function ModernAppBar() {  
  const theme = useTheme()  
    
  return (  
    <AppBar position="sticky"  
      sx={{  
        background: theme.palette.gradient.primary,  
        backdropFilter: 'blur(12px)',  
        boxShadow: 'none'  
      }}>  
      <Toolbar>  
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>  
          BrainSpark  
        </Typography>  
        <ThemeToggle />  
      </Toolbar>  
    </AppBar>  
  )  
}  
```  

### Animated Components  
```tsx  
// src/components/Controls/ThemeToggle.tsx  
export default function ThemeToggle() {  
  return (  
    <IconButton sx={{ position: 'relative', overflow: 'hidden' }}>  
      <AnimatePresence initial={false}>  
        <motion.div  
          key={darkMode ? 'moon' : 'sun'}  
          initial={{ y: -30, opacity: 0 }}  
          animate={{ y: 0, opacity: 1 }}  
          exit={{ y: 30, opacity: 0 }}  
          transition={{ duration: 0.2 }}  
        >  
          {darkMode ? <Brightness3 /> : <Brightness7 />}  
        </motion.div>  
      </AnimatePresence>  
    </IconButton>  
  )  
}  
```  

## Design System Specifications  

### Color Palette  
```ts  
const modernColors = {  
  electricViolet: '#6366f1',  
  mediumSlateBlue: '#818cf8',  
  emeraldGreen: '#10b981',  
  mintGreen: '#34d399',  
  cosmicPurple: '#a855f7',  
  twilightBlue: '#0f172a'  
}  
```  

### Gradient Presets  
```ts  
const gradients = {  
  primary: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',  
  success: 'linear-gradient(45deg, #10b981 0%, #34d399 100%)',  
  error: 'linear-gradient(45deg, #ef4444 0%, #f97316 100%)'  
}  
```  

### Motion Configuration  
```ts  
const motion = {  
  hover: { scale: 1.05 },  
  tap: { scale: 0.95 },  
  spring: { type: 'spring', stiffness: 400, damping: 15 }  
}  
```  

## Verification Checklist  

### Theme System Validation  
- [ ] Gradient transitions work in light/dark modes  
- [ ] All buttons have hover elevation and scale effects  
- [ ] Paper components show surface gradients correctly  
- [ ] Custom color variables propagate through all components  

### Animation Requirements  
- [ ] Theme toggle has smooth icon transition  
- [ ] Card hover effects maintain z-index hierarchy  
- [ ] Loading spinner rotates continuously  
- [ ] Mobile menu transitions respect reduced motion prefs  

### Design Consistency  
- [ ] All radius values use 16px baseline  
- [ ] Typography hierarchy follows 1.333 ratio  
- [ ] Spacing system uses 8px base units  
- [ ] Shadow intensities match depth hierarchy