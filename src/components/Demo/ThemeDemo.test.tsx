// src/components/Demo/ThemeDemo.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThemeDemo from './ThemeDemo';

// Mock ModernAppBar
vi.mock('../Navigation/AppBar', () => ({
  default: ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <header data-testid="modern-app-bar">
      <h1>{title}</h1>
      {children}
    </header>
  )
}));

// Mock MindMapNode
vi.mock('../MindMap/MindMapNode', () => ({
  default: ({ 
    id, 
    title, 
    description, 
    isRoot, 
    isSelected 
  }: { 
    id: string, 
    title: string, 
    description?: string, 
    isRoot?: boolean, 
    isSelected?: boolean 
  }) => (
    <div 
      data-testid={`mind-map-node-${id}`}
      data-is-root={isRoot ? 'true' : 'false'}
      data-is-selected={isSelected ? 'true' : 'false'}
    >
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}));

// Mock useTheme from our context
vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    mode: 'light',
    settings: {
      reducedMotion: false,
      colorScheme: 'default'
    }
  })
}));

describe('ThemeDemo', () => {
  it('renders the demo page with correct title', () => {
    render(<ThemeDemo />);
    
    expect(screen.getByText('Theme System Demo')).toBeInTheDocument();
    expect(screen.getByText('Modern UI with Accessibility')).toBeInTheDocument();
  });
  
  it('displays current theme settings', () => {
    render(<ThemeDemo />);
    
    expect(screen.getByText(/Current theme mode:/)).toHaveTextContent('Current theme mode: light');
    expect(screen.getByText(/Reduced motion:/)).toHaveTextContent('Reduced motion: No');
    expect(screen.getByText(/Color scheme:/)).toHaveTextContent('Color scheme: default');
  });
  
  it('renders buttons section', () => {
    render(<ThemeDemo />);
    
    expect(screen.getByText('Gradient Buttons')).toBeInTheDocument();
    expect(screen.getByText('Primary Button')).toBeInTheDocument();
    expect(screen.getByText('Secondary Button')).toBeInTheDocument();
    expect(screen.getByText('Outlined Button')).toBeInTheDocument();
  });
  
  it('renders mind map nodes section', () => {
    render(<ThemeDemo />);
    
    expect(screen.getByText('Mind Map Nodes')).toBeInTheDocument();
    expect(screen.getByText('Root Node')).toBeInTheDocument();
    expect(screen.getByText('Regular Node')).toBeInTheDocument();
    expect(screen.getByText('Selected Node')).toBeInTheDocument();
    
    // Check that nodes have correct properties
    expect(screen.getByTestId('mind-map-node-node1')).toHaveAttribute('data-is-root', 'true');
    expect(screen.getByTestId('mind-map-node-node3')).toHaveAttribute('data-is-selected', 'true');
  });
  
  it('displays different theme settings when in dark mode', () => {
    // Override the mock to simulate dark mode
    vi.mocked(require('../../contexts/ThemeContext').useTheme).mockReturnValue({
      mode: 'dark',
      settings: {
        reducedMotion: false,
        colorScheme: 'default'
      }
    });
    
    render(<ThemeDemo />);
    
    expect(screen.getByText(/Current theme mode:/)).toHaveTextContent('Current theme mode: dark');
  });
  
  it('displays different theme settings with reduced motion', () => {
    // Override the mock to simulate reduced motion
    vi.mocked(require('../../contexts/ThemeContext').useTheme).mockReturnValue({
      mode: 'light',
      settings: {
        reducedMotion: true,
        colorScheme: 'default'
      }
    });
    
    render(<ThemeDemo />);
    
    expect(screen.getByText(/Reduced motion:/)).toHaveTextContent('Reduced motion: Yes');
  });
});
