import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OpenRouterService from './openRouterService';
import { ChatMessage } from './types';

// Mock fetch
global.fetch = vi.fn();

// Mock console methods
vi.mock('../../utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn()
}));

describe('OpenRouterService', () => {
  let openRouterService: OpenRouterService;
  
  beforeEach(() => {
    // Create service with test config
    openRouterService = new OpenRouterService({
      apiKey: 'test-api-key',
      baseUrl: 'https://test-api.com',
      defaultModel: 'test-model'
    });
    
    // Reset mocks
    vi.resetAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('sendChatRequest', () => {
    it('should send a request to the OpenRouter API and return a response', async () => {
      // Mock successful response
      const mockResponse = {
        id: 'test-id',
        model: 'test-model',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Test response'
            }
          }
        ]
      };
      
      // Setup fetch mock
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
      
      // Test messages
      const messages: Omit<ChatMessage, 'timestamp'>[] = [
        { role: 'user', content: 'Test message' }
      ];
      
      // Call the method
      const result = await openRouterService.sendChatRequest(messages);
      
      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-api.com/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key'
          }),
          body: expect.any(String)
        })
      );
      
      // Verify payload
      const payload = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(payload).toEqual({
        messages: [{ role: 'user', content: 'Test message' }],
        model: 'test-model',
        stream: false
      });
      
      // Verify result
      expect(result).toEqual({
        message: {
          role: 'assistant',
          content: 'Test response',
          timestamp: expect.any(Number)
        },
        status: 'complete',
        model: 'test-model',
        id: 'test-id'
      });
    });
    
    it('should handle API errors', async () => {
      // Mock error response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: 'Bad request'
          }
        })
      });
      
      // Test messages
      const messages: Omit<ChatMessage, 'timestamp'>[] = [
        { role: 'user', content: 'Test message' }
      ];
      
      // Call the method
      const result = await openRouterService.sendChatRequest(messages);
      
      // Verify result
      expect(result).toEqual({
        error: 'api_error',
        message: 'Bad request',
        status: 400
      });
    });
    
    it('should handle unexpected errors', async () => {
      // Mock network error
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      // Test messages
      const messages: Omit<ChatMessage, 'timestamp'>[] = [
        { role: 'user', content: 'Test message' }
      ];
      
      // Call the method
      const result = await openRouterService.sendChatRequest(messages);
      
      // Verify result
      expect(result).toEqual({
        error: 'unexpected_error',
        message: 'Network error',
        status: 500
      });
    });
  });
  
  describe('cancelRequest', () => {
    it('should cancel an ongoing request', async () => {
      // Create mock abort controller
      const mockAbort = vi.fn();
      const mockController = { abort: mockAbort, signal: {} };
      vi.spyOn(global, 'AbortController').mockImplementation(() => mockController as any);
      
      // Setup fetch to never resolve
      (global.fetch as any).mockImplementation(() => new Promise(() => {}));
      
      // Start a request but don't await it
      const requestPromise = openRouterService.sendChatRequest([
        { role: 'user', content: 'Test message' }
      ]);
      
      // Cancel the request
      openRouterService.cancelRequest();
      
      // Verify abort was called
      expect(mockAbort).toHaveBeenCalled();
    });
  });
});
