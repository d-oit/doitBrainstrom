import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  CircularProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { ChatOptions } from '../../services/llm/types';
import { sanitizeTextInput } from '../../utils/inputSanitization';

interface MessageInputProps {
  onSendMessage: (content: string, options?: ChatOptions) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
  maxLength?: number;
}

/**
 * Component for chat message input
 */
const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = 'Type your message...',
  maxLength = 1000
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle message change
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Limit message length
    if (value.length <= maxLength) {
      setMessage(value);
    }
  };

  // Handle message submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    // Sanitize input
    const sanitizedMessage = sanitizeTextInput(message);
    
    // Clear input
    setMessage('');
    
    // Send message
    await onSendMessage(sanitizedMessage);
    
    // Focus input after sending
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder={placeholder}
        value={message}
        onChange={handleMessageChange}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        disabled={isLoading}
        variant="outlined"
        size="small"
        InputProps={{
          sx: {
            borderRadius: 2,
            pr: 1
          }
        }}
        helperText={
          message.length > 0 && 
          <Box component="span" sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            color: message.length > maxLength * 0.8 ? 'warning.main' : 'text.secondary'
          }}>
            {message.length}/{maxLength}
          </Box>
        }
      />
      
      <Tooltip title={isLoading ? "Processing..." : "Send message"}>
        <span>
          <IconButton
            color="primary"
            type="submit"
            disabled={!message.trim() || isLoading}
            sx={{
              height: 40,
              width: 40,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              '&.Mui-disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled
              }
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default MessageInput;
