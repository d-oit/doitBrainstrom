import React from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, useTheme } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { ChatMessage } from '../../services/llm/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * Component to display a single chat message
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const theme = useTheme();
  const isUser = message.role === 'user';
  
  // Format timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '80%'
      }}
    >
      {/* Message header with icon and time */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 0.5,
          ml: isUser ? 0 : 1,
          mr: isUser ? 1 : 0
        }}
      >
        {isUser ? (
          <PersonIcon fontSize="small" color="primary" />
        ) : (
          <SmartToyIcon fontSize="small" color="secondary" />
        )}
        <Typography variant="caption" color="text.secondary">
          {isUser ? 'You' : 'Assistant'} • {formattedTime}
        </Typography>
      </Box>

      {/* Message content */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: isUser 
            ? theme.palette.primary.main 
            : theme.palette.background.paper,
          color: isUser 
            ? theme.palette.primary.contrastText 
            : theme.palette.text.primary,
          position: 'relative',
          '&:hover .copy-button': {
            opacity: 1
          }
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </Typography>

        {/* Copy button (only for assistant messages) */}
        {!isUser && (
          <Tooltip title="Copy to clipboard">
            <IconButton
              size="small"
              onClick={handleCopy}
              className="copy-button"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                opacity: 0,
                transition: 'opacity 0.2s',
                backgroundColor: theme.palette.background.default,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Paper>
    </Box>
  );
};

export default MessageBubble;
