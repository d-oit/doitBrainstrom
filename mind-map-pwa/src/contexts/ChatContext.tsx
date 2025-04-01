import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { openRouterService } from '../services/llm/openRouterService';
import { ChatMessage, ChatOptions, ChatSession } from '../services/llm/types';
import { logError, logInfo } from '../utils/logger';

interface ChatContextProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, options?: ChatOptions) => Promise<void>;
  clearMessages: () => void;
  cancelRequest: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  createSession: () => string;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loadSessions = () => {
      try {
        const savedSessions = localStorage.getItem('chat-sessions');
        if (savedSessions) {
          const parsedSessions = JSON.parse(savedSessions) as ChatSession[];
          setSessions(parsedSessions);
          
          // Load last active session if available
          const lastSessionId = localStorage.getItem('last-chat-session');
          if (lastSessionId) {
            const session = parsedSessions.find(s => s.id === lastSessionId);
            if (session) {
              setCurrentSessionId(session.id);
              setMessages(session.messages);
            }
          }
        }
      } catch (error) {
        logError('Error loading chat sessions:', error);
      }
    };

    loadSessions();
  }, []);

  // Save sessions to localStorage when they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chat-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save current session ID to localStorage when it changes
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('last-chat-session', currentSessionId);
    }
  }, [currentSessionId]);

  // Update session when messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prevSessions => {
        const updatedSessions = prevSessions.map(session => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages,
              updatedAt: Date.now()
            };
          }
          return session;
        });
        return updatedSessions;
      });
    }
  }, [messages, currentSessionId]);

  // Send a message to the OpenRouter API
  const sendMessage = useCallback(async (content: string, options?: ChatOptions) => {
    if (!content.trim()) return;

    // Create user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: Date.now()
    };

    // Add user message to state
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Create message history for the API request
      const messageHistory = [
        // Add system message for context
        {
          role: 'system' as const,
          content: 'You are a helpful assistant for a mind mapping application. Provide concise, clear responses.'
        },
        // Add previous messages (limited to last 10 for context)
        ...messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        // Add the new user message
        {
          role: userMessage.role,
          content: userMessage.content
        }
      ];

      // Send request to OpenRouter API
      const response = await openRouterService.sendChatRequest(messageHistory, options);

      // Handle error response
      if ('error' in response) {
        setError(response.message);
        return;
      }

      // Add assistant response to state
      setMessages(prev => [...prev, response.message]);
    } catch (error) {
      logError('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  // Clear all messages in the current session
  const clearMessages = useCallback(() => {
    setMessages([]);
    
    // Update current session if it exists
    if (currentSessionId) {
      setSessions(prevSessions => {
        return prevSessions.map(session => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [],
              updatedAt: Date.now()
            };
          }
          return session;
        });
      });
    }
  }, [currentSessionId]);

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    openRouterService.cancelRequest();
    setIsLoading(false);
  }, []);

  // Create a new chat session
  const createSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      messages: [],
      model: import.meta.env.VITE_OPENROUTER_DEFAULT_MODEL,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSessionId);
    setMessages([]);
    
    logInfo('Created new chat session:', newSessionId);
    return newSessionId;
  }, []);

  // Load an existing session
  const loadSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      logInfo('Loaded chat session:', sessionId);
    } else {
      logError('Session not found:', sessionId);
    }
  }, [sessions]);

  // Delete a session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    // If deleting current session, create a new one
    if (sessionId === currentSessionId) {
      const newSessionId = createSession();
      setCurrentSessionId(newSessionId);
    }
    
    logInfo('Deleted chat session:', sessionId);
  }, [currentSessionId, createSession]);

  // Create context value
  const value: ChatContextProps = {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    cancelRequest,
    sessions,
    currentSessionId,
    createSession,
    loadSession,
    deleteSession
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatContextProvider');
  }
  return context;
};

export default ChatContext;
