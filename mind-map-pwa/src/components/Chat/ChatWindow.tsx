import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Drawer,
  useTheme,
  useMediaQuery,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatHistory from './ChatHistory';
import MessageInput from './MessageInput';
import { useChat } from '../../contexts/ChatContext';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Main chat window component
 */
const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { messages, isLoading, error, sendMessage, clearMessages, sessions, currentSessionId, createSession, loadSession, deleteSession } = useChat();
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [sessionMenuAnchor, setSessionMenuAnchor] = React.useState<null | HTMLElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Handle session menu open
  const handleSessionMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSessionMenuAnchor(event.currentTarget);
  };

  // Handle session menu close
  const handleSessionMenuClose = () => {
    setSessionMenuAnchor(null);
  };

  // Handle clear messages
  const handleClearMessages = () => {
    clearMessages();
    handleMenuClose();
  };

  // Handle new session
  const handleNewSession = () => {
    createSession();
    handleSessionMenuClose();
  };

  // Handle load session
  const handleLoadSession = (sessionId: string) => {
    loadSession(sessionId);
    handleSessionMenuClose();
  };

  // Handle delete session
  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    handleSessionMenuClose();
  };

  // Get current session name
  const getCurrentSessionName = () => {
    if (!currentSessionId) return 'New Chat';
    
    const session = sessions.find(s => s.id === currentSessionId);
    if (!session) return 'New Chat';
    
    // Use first message as name or default
    const firstUserMessage = session.messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      // Truncate long messages
      return firstUserMessage.content.length > 20
        ? `${firstUserMessage.content.substring(0, 20)}...`
        : firstUserMessage.content;
    }
    
    return 'New Chat';
  };

  // Render chat window content
  const chatContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: isMobile ? '100%' : '400px',
        maxWidth: '100vw'
      }}
    >
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            size="small"
            onClick={handleSessionMenuOpen}
            endIcon={<MoreVertIcon />}
            sx={{ textTransform: 'none' }}
          >
            {getCurrentSessionName()}
          </Button>
          
          {/* Session Menu */}
          <Menu
            anchorEl={sessionMenuAnchor}
            open={Boolean(sessionMenuAnchor)}
            onClose={handleSessionMenuClose}
          >
            <MenuItem onClick={handleNewSession}>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>New Chat</ListItemText>
            </MenuItem>
            <Divider />
            {sessions.map(session => (
              <MenuItem 
                key={session.id}
                onClick={() => handleLoadSession(session.id)}
                selected={session.id === currentSessionId}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  maxWidth: '300px'
                }}
              >
                <Typography noWrap sx={{ maxWidth: '200px' }}>
                  {session.messages.find(m => m.role === 'user')?.content.substring(0, 20) || 'New Chat'}
                </Typography>
                {session.id !== currentSessionId && (
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </MenuItem>
            ))}
          </Menu>
        </Box>
        
        <Box>
          <IconButton
            aria-label="chat options"
            onClick={handleMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
          
          {/* Options Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleClearMessages}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Clear Messages</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
          </Menu>
          
          <IconButton
            aria-label="close chat"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Chat History */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: theme.palette.background.default
        }}
      >
        <ChatHistory messages={messages} isLoading={isLoading} error={error} />
        <div ref={chatEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
      </Box>
    </Box>
  );

  // Render as drawer on mobile, paper on desktop
  return isMobile ? (
    <Drawer
      anchor="bottom"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          height: '80vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }
      }}
    >
      {chatContent}
    </Drawer>
  ) : (
    <Box
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        zIndex: 999,
        display: isOpen ? 'block' : 'none',
        boxShadow: theme.shadows[10],
        borderRadius: 2,
        overflow: 'hidden',
        maxHeight: '80vh'
      }}
    >
      <Paper elevation={4} sx={{ height: '600px' }}>
        {chatContent}
      </Paper>
    </Box>
  );
};

export default ChatWindow;
