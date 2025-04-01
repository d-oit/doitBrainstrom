import React from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import MessageBubble from './MessageBubble';
import { ChatMessage } from '../../services/llm/types';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Component to display chat message history
 */
const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading, error }) => {
  // If no messages, show welcome message
  if (messages.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" gutterBottom>
          Welcome to Mind Map Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ask me anything about mind mapping, brainstorming, or how to use this application.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Render messages */}
      {messages.map((message, index) => (
        <MessageBubble
          key={`${message.timestamp}-${index}`}
          message={message}
        />
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 1,
            p: 2,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            maxWidth: '80%'
          }}
        >
          <CircularProgress size={20} />
          <Typography variant="body2">Thinking...</Typography>
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ChatHistory;
