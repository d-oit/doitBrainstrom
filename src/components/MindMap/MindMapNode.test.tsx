// src/components/MindMap/MindMapNode.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MindMapNode from './MindMapNode';

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
          primary: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          surface: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
        }
      },
      transitions: {
        create: () => 'all 0.2s ease',
        duration: { shorter: 150 }
      },
      spacing: (value: number) => `${value * 8}px`,
      shadows: Array(25).fill('none')
    })
  };
});

// Mock useTheme from our context
vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    isHighContrastMode: false,
    settings: {
      reducedMotion: false
    }
  })
}));

describe('MindMapNode', () => {
  it('renders with title', () => {
    render(<MindMapNode id="test-node" title="Test Node" />);
    
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });
  
  it('renders with description when provided', () => {
    render(
      <MindMapNode 
        id="test-node" 
        title="Test Node" 
        description="This is a test description"
      />
    );
    
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });
  
  it('applies root node styling', () => {
    render(
      <MindMapNode 
        id="root-node" 
        title="Root Node" 
        isRoot={true}
      />
    );
    
    // Root node should have h6 typography
    const title = screen.getByText('Root Node');
    expect(title.tagName).toBe('H6');
  });
  
  it('applies selected node styling', () => {
    render(
      <MindMapNode 
        id="selected-node" 
        title="Selected Node" 
        isSelected={true}
      />
    );
    
    // Selected node should have aria-pressed="true"
    const node = screen.getByRole('button', { name: 'Selected Node' });
    expect(node).toHaveAttribute('aria-pressed', 'true');
  });
  
  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <MindMapNode 
        id="clickable-node" 
        title="Clickable Node" 
        onClick={handleClick}
      />
    );
    
    // Click the node
    await user.click(screen.getByText('Clickable Node'));
    
    // Verify onClick was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('renders correctly in high contrast mode', () => {
    // Override the mock to simulate high contrast mode
    vi.mocked(require('../../contexts/ThemeContext').useTheme).mockReturnValue({
      isHighContrastMode: true,
      settings: {
        reducedMotion: false
      }
    });
    
    render(
      <MindMapNode 
        id="high-contrast-node" 
        title="High Contrast Node" 
        isRoot={true}
      />
    );
    
    // In high contrast mode, the node should have specific styling
    const node = screen.getByRole('button', { name: 'High Contrast Node' });
    expect(node).toHaveStyle({ backgroundColor: '#000000' });
  });
  
  it('respects reduced motion settings', () => {
    // Override the mock to simulate reduced motion
    vi.mocked(require('../../contexts/ThemeContext').useTheme).mockReturnValue({
      isHighContrastMode: false,
      settings: {
        reducedMotion: true
      }
    });
    
    render(
      <MindMapNode 
        id="reduced-motion-node" 
        title="Reduced Motion Node" 
      />
    );
    
    // With reduced motion, the node should have transition: none
    const node = screen.getByRole('button', { name: 'Reduced Motion Node' });
    expect(node).toHaveStyle({ transition: 'none' });
  });
});
