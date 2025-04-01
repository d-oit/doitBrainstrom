import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import { ChatContextProvider, useChat } from './ChatContext';
import { openRouterService } from '../services/llm/openRouterService';

// Mock the openRouterService
vi.mock('../services/llm/openRouterService', () => ({
  openRouterService: {
    sendChatRequest: vi.fn(),
    cancelRequest: vi.fn()
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ChatContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorageMock.clear();
  });
  
  it('provides initial state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChatContextProvider>{children}</ChatContextProvider>
    );
    
    const { result } = renderHook(() => useChat(), { wrapper });
    
    expect(result.current).toEqual(expect.objectContaining({
      messages: [],
      isLoading: false,
      error: null,
      sessions: [],
      currentSessionId: null
    }));
    
    expect(typeof result.current.sendMessage).toBe('function');
    expect(typeof result.current.clearMessages).toBe('function');
    expect(typeof result.current.cancelRequest).toBe('function');
    expect(typeof result.current.createSession).toBe('function');
    expect(typeof result.current.loadSession).toBe('function');
    expect(typeof result.current.deleteSession).toBe('function');
  });
  
  it('sends a message and updates state', async () => {
    // Mock successful response
    const mockResponse = {
      message: {
        role: 'assistant',
        content: 'Test response',
        timestamp: Date.now()
      },
      status: 'complete',
      model: 'test-model',
      id: 'test-id'
    };
    (openRouterService.sendChatRequest as any).mockResolvedValue(mockResponse);
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChatContextProvider>{children}</ChatContextProvider>
    );
    
    const { result } = renderHook(() => useChat(), { wrapper });
    
    // Send a message
    await act(async () => {
      await result.current.sendMessage('Test message');
    });
    
    // Check that the message was added to state
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual(expect.objectContaining({
      role: 'user',
      content: 'Test message'
    }));
    expect(result.current.messages[1]).toEqual(expect.objectContaining({
      role: 'assistant',
      content: 'Test response'
    }));
    
    // Check that the API was called correctly
    expect(openRouterService.sendChatRequest).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'system',
          content: expect.any(String)
        }),
        expect.objectContaining({
          role: 'user',
          content: 'Test message'
        })
      ]),
      undefined
    );
  });
  
  it('creates and manages sessions', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChatContextProvider>{children}</ChatContextProvider>
    );
    
    const { result } = renderHook(() => useChat(), { wrapper });
    
    // Create a new session
    let sessionId: string;
    await act(async () => {
      sessionId = result.current.createSession();
    });
    
    // Check that the session was created
    expect(result.current.currentSessionId).toBe(sessionId);
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].id).toBe(sessionId);
    
    // Send a message in this session
    await act(async () => {
      await result.current.sendMessage('Test message');
    });
    
    // Create another session
    let secondSessionId: string;
    await act(async () => {
      secondSessionId = result.current.createSession();
    });
    
    // Check that we have two sessions now
    expect(result.current.sessions).toHaveLength(2);
    expect(result.current.currentSessionId).toBe(secondSessionId);
    
    // Load the first session
    await act(async () => {
      result.current.loadSession(sessionId);
    });
    
    // Check that the first session is loaded
    expect(result.current.currentSessionId).toBe(sessionId);
    expect(result.current.messages).toHaveLength(1); // Only the user message, no response in this test
    
    // Delete the first session
    await act(async () => {
      result.current.deleteSession(sessionId);
    });
    
    // Check that the session was deleted
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].id).toBe(secondSessionId);
  });
  
  it('clears messages in the current session', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChatContextProvider>{children}</ChatContextProvider>
    );
    
    const { result } = renderHook(() => useChat(), { wrapper });
    
    // Create a session
    await act(async () => {
      result.current.createSession();
    });
    
    // Send a message
    await act(async () => {
      await result.current.sendMessage('Test message');
    });
    
    // Check that we have a message
    expect(result.current.messages).toHaveLength(1);
    
    // Clear messages
    await act(async () => {
      result.current.clearMessages();
    });
    
    // Check that messages are cleared
    expect(result.current.messages).toHaveLength(0);
  });
  
  it('cancels an ongoing request', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChatContextProvider>{children}</ChatContextProvider>
    );
    
    const { result } = renderHook(() => useChat(), { wrapper });
    
    // Cancel request
    await act(async () => {
      result.current.cancelRequest();
    });
    
    // Check that cancelRequest was called
    expect(openRouterService.cancelRequest).toHaveBeenCalled();
  });
});
