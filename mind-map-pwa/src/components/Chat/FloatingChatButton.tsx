import React, { useState } from 'react';
import { Box, Fab, Tooltip, Badge, useTheme } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ChatWindow from './ChatWindow';
import { useChat } from '../../contexts/ChatContext';

interface FloatingChatButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Floating chat button that opens the chat window
 */
const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ 
  position = 'bottom-right' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages } = useChat();
  const theme = useTheme();

  // Calculate position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: 16, left: 16 };
      case 'top-right':
        return { top: 16, right: 16 };
      case 'top-left':
        return { top: 16, left: 16 };
      case 'bottom-right':
      default:
        return { bottom: 16, right: 16 };
    }
  };

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  // Count unread messages (simplified implementation)
  const unreadCount = 0; // This would be implemented with actual unread tracking

  return (
    <>
      {/* Floating button */}
      <Box
        sx={{
          position: 'fixed',
          zIndex: 1000,
          ...getPositionStyles()
        }}
      >
        <Tooltip 
          title={isOpen ? "Close chat" : "Open chat assistance"}
          placement="left"
        >
          <Fab
            color="primary"
            aria-label={isOpen ? "Close chat" : "Open chat assistance"}
            onClick={toggleChat}
            aria-expanded={isOpen}
            aria-controls="chat-panel"
            sx={{
              boxShadow: theme.shadows[8],
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            <Badge 
              badgeContent={unreadCount} 
              color="error"
              invisible={unreadCount === 0}
            >
              {isOpen ? <CloseIcon /> : <ChatIcon />}
            </Badge>
          </Fab>
        </Tooltip>
      </Box>

      {/* Chat window */}
      <ChatWindow 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default FloatingChatButton;
