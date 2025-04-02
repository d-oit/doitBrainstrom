// src/components/Navigation/AppBar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModernAppBar from './AppBar';

// Mock useTheme from MUI
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useTheme: () => ({
      palette: {
        mode: 'light',
        primary: { main: '#6366f1' },
        gradient: {
          primary: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
        }
      },
      transitions: {
        create: () => 'all 0.2s ease'
      }
    })
  };
});

// Mock useTheme from our context
vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    mode: 'light',
    setMode: vi.fn(),
    isHighContrastMode: false,
    settings: {
      reducedMotion: false
    }
  })
}));

describe('ModernAppBar', () => {
  it('renders with default title', () => {
    render(<ModernAppBar />);
    
    expect(screen.getByText('BrainSpark')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle theme mode/i })).toBeInTheDocument();
  });
  
  it('renders with custom title', () => {
    render(<ModernAppBar title="Custom Title" />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });
  
  it('renders children', () => {
    render(
      <ModernAppBar>
        <button>Test Button</button>
      </ModernAppBar>
    );
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });
  
  it('toggles theme when button is clicked', async () => {
    const mockSetMode = vi.fn();
    
    // Override the mock to provide our own setMode function
    vi.mocked(require('../../contexts/ThemeContext').useTheme).mockReturnValue({
      mode: 'light',
      setMode: mockSetMode,
      isHighContrastMode: false,
      settings: {
        reducedMotion: false
      }
    });
    
    const user = userEvent.setup();
    render(<ModernAppBar />);
    
    // Click the theme toggle button
    await user.click(screen.getByRole('button', { name: /toggle theme mode/i }));
    
    // Verify setMode was called with 'dark'
    expect(mockSetMode).toHaveBeenCalledWith('dark');
  });
  
  it('renders high contrast mode correctly', () => {
    // Override the mock to simulate high contrast mode
    vi.mocked(require('../../contexts/ThemeContext').useTheme).mockReturnValue({
      mode: 'high-contrast',
      setMode: vi.fn(),
      isHighContrastMode: true,
      settings: {
        reducedMotion: false
      }
    });
    
    render(<ModernAppBar />);
    
    // In high contrast mode, the AppBar should have specific styling
    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveStyle({ borderBottom: '2px solid #ffffff' });
  });
});
