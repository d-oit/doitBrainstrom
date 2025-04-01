import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FloatingChatButton from './FloatingChatButton';
import { ChatContextProvider } from '../../contexts/ChatContext';

// Mock Material UI hooks
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useTheme: () => ({
      palette: {
        primary: { main: '#1976d2' },
        background: { paper: '#fff' },
        text: { primary: '#000' },
        divider: '#e0e0e0'
      },
      shadows: Array(25).fill('none'),
      spacing: (factor: number) => `${factor * 8}px`,
      breakpoints: {
        down: () => false
      }
    })
  };
});

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
    const buttonContainer = screen.getByRole('button', { name: /Open chat assistance/i }).closest('div');

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
