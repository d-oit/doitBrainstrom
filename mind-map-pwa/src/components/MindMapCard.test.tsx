import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MindMapCard from './MindMapCard';
import { ResponsiveContextProvider } from '../contexts/ResponsiveContext';
// Mock Material UI components
vi.mock('@mui/material', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="mui-card" className="MuiCard-root" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  useTheme: () => ({
    breakpoints: {
      up: () => false,
      down: () => false,
      between: () => false
    }
  }),
  useMediaQuery: () => false,
  ThemeProvider: ({ children }: any) => <div>{children}</div>,
  createTheme: () => ({})
}), { virtual: true });

import { ThemeProvider, createTheme } from '@mui/material';

// Mock the useResponsive hook
vi.mock('../contexts/ResponsiveContext', () => ({
  ...vi.importActual('../contexts/ResponsiveContext'),
  useResponsive: () => ({
    viewport: {
      isMobile: false,
      isTablet: false,
      isDesktop: true
    },
    shouldReduceAnimations: false,
    shouldReduceImageQuality: false,
    shouldReduceMotion: false,
    network: {
      online: true,
      effectiveType: '4g'
    }
  })
}));

// Create a theme for testing
const theme = createTheme();

// Wrap component in ThemeProvider and ResponsiveContextProvider for testing
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <ResponsiveContextProvider>
        {component}
      </ResponsiveContextProvider>
    </ThemeProvider>
  );
};

describe('MindMapCard Component', () => {
  it('renders MindMapCard with title', () => {
    renderWithTheme(<MindMapCard title="Test Card Title" />);
    const titleElement = screen.getByText(/Test Card Title/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders MindMapCard with title and description', () => {
    renderWithTheme(<MindMapCard title="Card Title" description="Test description for card" />);
    const titleElement = screen.getByText(/Card Title/i);
    const descriptionElement = screen.getByText(/Test description for card/i);
    expect(titleElement).toBeInTheDocument();
    expect(descriptionElement).toBeInTheDocument();
  });

  it('does not render description if not provided', () => {
    renderWithTheme(<MindMapCard title="Title only card" />);
    const titleElement = screen.getByText(/Title only card/i);
    expect(titleElement).toBeInTheDocument();
    expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    renderWithTheme(<MindMapCard title="Clickable Card" onClick={handleClick} />);

    const card = screen.getByTestId('mui-card');
    expect(card).toBeInTheDocument();

    await userEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies draggable attribute when draggable prop is true', () => {
    renderWithTheme(<MindMapCard title="Draggable Card" draggable={true} />);

    const card = screen.getByTestId('mui-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('draggable', 'true');
  });

  it('is not draggable by default', () => {
    renderWithTheme(<MindMapCard title="Non-Draggable Card" />);

    const card = screen.getByTestId('mui-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('draggable', 'false');
  });
});
