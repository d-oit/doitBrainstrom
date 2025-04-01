import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { openRouterService } from '../services/llm/openRouterService';
import { ChatMessage, ChatOptions, ChatSession } from '../services/llm/types';
import { logError, logInfo } from '../utils/logger';
import {
  createNewConversation,
  getChatHistory,
  addUserMessage,
  addAssistantMessage,
  addSystemMessage
} from '../services/chatHistoryService';
import { runAllMigrations } from '../utils/migrationUtils';

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

  // Initialize and load sessions
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Run migrations from localStorage to IndexedDB
        await runAllMigrations();

        // For backward compatibility, still try localStorage first
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

                // Try to load messages from IndexedDB first
                try {
                  const chatHistory = await getChatHistory(session.id);
                  if (chatHistory && chatHistory.length > 0) {
                    // Convert IndexedDB format to ChatMessage format
                    const convertedMessages: ChatMessage[] = chatHistory.map(msg => ({
                      role: msg.role,
                      content: msg.content,
                      timestamp: new Date(msg.timestamp).getTime()
                    }));
                    setMessages(convertedMessages);
                  } else {
                    // Fall back to session messages if no IndexedDB history
                    setMessages(session.messages);
                  }
                } catch (dbError) {
                  logError('Error loading chat history from IndexedDB:', dbError);
                  // Fall back to session messages
                  setMessages(session.messages);
                }
              }
            }
          }
        } catch (localStorageError) {
          logError('Error loading chat sessions from localStorage:', localStorageError);
        }
      } catch (error) {
        logError('Error initializing chat:', error);
      }
    };

    initializeChat();
  }, []);

  // Save sessions to localStorage for backward compatibility
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chat-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save current session ID to localStorage for backward compatibility
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

  // Create a new chat session
  const createSession = useCallback(() => {
    // Use our chatHistoryService to create a new conversation ID
    const newSessionId = createNewConversation();

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

    // Add initial system message to IndexedDB if available
    if (typeof addSystemMessage === 'function') {
      addSystemMessage(newSessionId, 'You are a helpful assistant for a mind mapping application. Provide concise, clear responses.')
        .catch(error => logError('Error saving system message to IndexedDB:', error));
    }

    logInfo('Created new chat session:', newSessionId);
    return newSessionId;
  }, []);

  // Send a message to the OpenRouter API
  const sendMessage = useCallback(async (content: string, options?: ChatOptions) => {
    if (!content.trim()) return;

    // Ensure we have a session ID
    if (!currentSessionId) {
      createSession();
      return;
    }

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

    // Save user message to IndexedDB if available
    if (typeof addUserMessage === 'function') {
      await addUserMessage(currentSessionId, content).catch(error => {
        logError('Error saving user message to IndexedDB:', error);
      });
    }

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
      if (response && typeof response === 'object' && 'error' in response) {
        setError(response.message);
        return;
      }

      // Add assistant response to state
      if (response && response.message) {
        setMessages(prev => [...prev, response.message]);

        // Save assistant message to IndexedDB if available
        if (typeof addAssistantMessage === 'function') {
          await addAssistantMessage(currentSessionId, response.message.content).catch(error => {
            logError('Error saving assistant message to IndexedDB:', error);
          });
        }
      }
    } catch (error) {
      logError('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentSessionId, createSession]);

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

  // Load an existing session
  const loadSession = useCallback(async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);

      // Check if IndexedDB functions are available
      if (typeof getChatHistory === 'function' &&
          typeof addSystemMessage === 'function' &&
          typeof addUserMessage === 'function' &&
          typeof addAssistantMessage === 'function') {
        try {
          // Try to load messages from IndexedDB first
          const chatHistory = await getChatHistory(sessionId);
          if (chatHistory && chatHistory.length > 0) {
            // Convert IndexedDB format to ChatMessage format
            const convertedMessages: ChatMessage[] = chatHistory.map(msg => ({
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp).getTime()
            }));
            setMessages(convertedMessages);
          } else {
            // Fall back to session messages if no IndexedDB history
            setMessages(session.messages);

            // If we have messages in the session but not in IndexedDB, save them to IndexedDB
            if (session.messages.length > 0) {
              // Add system message first
              await addSystemMessage(sessionId, 'You are a helpful assistant for a mind mapping application. Provide concise, clear responses.');

              // Add all other messages
              for (const msg of session.messages) {
                if (msg.role === 'user') {
                  await addUserMessage(sessionId, msg.content);
                } else if (msg.role === 'assistant') {
                  await addAssistantMessage(sessionId, msg.content);
                }
              }
            }
          }
        } catch (error) {
          logError('Error loading chat history from IndexedDB:', error);
          // Fall back to session messages
          setMessages(session.messages);
        }
      } else {
        // IndexedDB functions not available, use session messages
        setMessages(session.messages);
      }

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
