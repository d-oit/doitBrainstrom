import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatContextProvider } from '../../contexts/ChatContext';

// Mock Material UI
vi.mock('@mui/material', () => ({
  ...vi.importActual('@mui/material'),
  useTheme: () => ({
    palette: {
      primary: { main: '#1976d2', contrastText: '#fff' },
      background: { paper: '#fff', default: '#fafafa' },
      text: { primary: '#000', secondary: '#666' },
      divider: '#e0e0e0',
      action: { hover: '#f5f5f5', disabledBackground: '#e0e0e0', disabled: '#9e9e9e' }
    },
    shadows: Array(25).fill('none'),
    spacing: (factor: number) => `${factor * 8}px`,
    breakpoints: {
      down: () => false,
      up: () => false,
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }
    }
  }),
  Fab: ({ children, ...props }: any) => <button data-testid="fab" {...props}>{children}</button>,
  Badge: ({ children, badgeContent, invisible, color, ...props }: any) => (
    <div data-testid="badge" data-badge-content={badgeContent} data-invisible={invisible} data-color={color} {...props}>
      {children}
    </div>
  ),
  Box: ({ children, sx, ...props }: any) => {
    // Convert sx object to style string
    let styleString = '';
    if (sx) {
      if (sx.position) styleString += `position: ${sx.position};`;
      if (sx.zIndex) styleString += `z-index: ${sx.zIndex};`;
      if (sx.bottom) styleString += `bottom: ${sx.bottom}px;`;
      if (sx.right) styleString += `right: ${sx.right}px;`;
      if (sx.left) styleString += `left: ${sx.left}px;`;
      if (sx.top) styleString += `top: ${sx.top}px;`;
    }
    return <div data-testid="box" style={styleString ? styleString : undefined} {...props}>{children}</div>;
  },
  Tooltip: ({ children, ...props }: any) => <div data-testid="tooltip" {...props}>{children}</div>
}));

// Import after mocks
import FloatingChatButton from './FloatingChatButton';

// Mock the ChatWindow component
vi.mock('./ChatWindow', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="chat-window" data-is-open={isOpen}>
      {isOpen && <button onClick={onClose}>Close</button>}
    </div>
  )
}));

describe('FloatingChatButton', () => {
  it('renders the floating button', () => {
    render(
      <ChatContextProvider>
        <FloatingChatButton />
      </ChatContextProvider>
    );

    // Check if the button is rendered
    const button = screen.getByRole('button', { name: /Open chat assistance/i });
    expect(button).toBeInTheDocument();

    // Check if the chat icon is rendered
    const chatIcon = document.querySelector('svg');
    expect(chatIcon).toBeInTheDocument();
  });

  it('toggles the chat window when clicked', () => {
    render(
      <ChatContextProvider>
        <FloatingChatButton />
      </ChatContextProvider>
    );

    // Get the button
    const button = screen.getByRole('button', { name: /Open chat assistance/i });

    // Check that chat window is initially closed
    const chatWindow = screen.getByTestId('chat-window');
    expect(chatWindow.getAttribute('data-is-open')).toBe('false');

    // Click the button to open the chat window
    fireEvent.click(button);

    // Check that chat window is now open
    expect(chatWindow.getAttribute('data-is-open')).toBe('true');

    // Check that button now has close label
    expect(screen.getByRole('button', { name: /Close chat/i })).toBeInTheDocument();

    // Click the button again to close the chat window
    fireEvent.click(button);

    // Check that chat window is closed again
    expect(chatWindow.getAttribute('data-is-open')).toBe('false');
  });

  it('positions the button according to the position prop', () => {
    const { rerender } = render(
      <ChatContextProvider>
        <FloatingChatButton position="bottom-right" />
      </ChatContextProvider>
    );

    // Get the button container
    const buttonContainer = screen.getByTestId('box');

    // Check bottom-right position
    expect(buttonContainer).toHaveStyle('bottom: 16px');
    expect(buttonContainer).toHaveStyle('right: 16px');

    // Rerender with different position
    rerender(
      <ChatContextProvider>
        <FloatingChatButton position="bottom-left" />
      </ChatContextProvider>
    );

    // Check bottom-left position
    expect(buttonContainer).toHaveStyle('bottom: 16px');
    expect(buttonContainer).toHaveStyle('left: 16px');
  });
});
