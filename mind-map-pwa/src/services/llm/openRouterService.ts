import { logError, logInfo } from '../../utils/logger';
import { sanitizeTextInput } from '../../utils/inputSanitization';
import {
  ChatError,
  ChatMessage,
  ChatOptions,
  ChatRequest,
  ChatResponse,
  ChatStreamCallback,
  OpenRouterConfig,
  StreamingChunk
} from './types';

/**
 * Default configuration for OpenRouter API
 */
const defaultConfig: OpenRouterConfig = {
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  defaultModel: import.meta.env.VITE_OPENROUTER_DEFAULT_MODEL || 'openai/gpt-3.5-turbo'
};

/**
 * OpenRouter API client
 */
export class OpenRouterService {
  private config: OpenRouterConfig;
  private controller: AbortController | null = null;

  constructor(config: Partial<OpenRouterConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    
    if (!this.config.apiKey) {
      logError('OpenRouter API key is not configured');
    }
  }

  /**
   * Send a chat request to OpenRouter API
   * @param messages Chat messages
   * @param options Chat options
   * @returns Chat response
   */
  async sendChatRequest(
    messages: Omit<ChatMessage, 'timestamp'>[],
    options: ChatOptions = {}
  ): Promise<ChatResponse | ChatError> {
    try {
      // Sanitize input messages
      const sanitizedMessages = messages.map(msg => ({
        ...msg,
        content: sanitizeTextInput(msg.content)
      }));

      // Create request payload
      const payload: ChatRequest = {
        messages: sanitizedMessages,
        model: options.model || this.config.defaultModel,
        stream: options.stream || false,
        max_tokens: options.max_tokens,
        temperature: options.temperature
      };

      // Create abort controller for request cancellation
      this.controller = new AbortController();
      const signal = this.controller.signal;

      // Send request to OpenRouter API
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Mind Map PWA'
        },
        body: JSON.stringify(payload),
        signal
      });

      // Handle error response
      if (!response.ok) {
        const errorData = await response.json();
        logError('OpenRouter API error:', errorData);
        return {
          error: 'api_error',
          message: errorData.error?.message || 'Failed to get response from OpenRouter',
          status: response.status
        };
      }

      // Handle successful response
      const data = await response.json();
      
      // Format response
      const chatResponse: ChatResponse = {
        message: {
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: Date.now()
        },
        status: 'complete',
        model: data.model,
        id: data.id
      };

      logInfo('OpenRouter API response:', chatResponse);
      return chatResponse;
    } catch (error) {
      // Handle unexpected errors
      logError('OpenRouter API unexpected error:', error);
      return {
        error: 'unexpected_error',
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    } finally {
      this.controller = null;
    }
  }

  /**
   * Send a streaming chat request to OpenRouter API
   * @param messages Chat messages
   * @param callback Callback function for streaming chunks
   * @param options Chat options
   * @returns Promise that resolves when streaming is complete
   */
  async streamChatRequest(
    messages: Omit<ChatMessage, 'timestamp'>[],
    callback: ChatStreamCallback,
    options: ChatOptions = {}
  ): Promise<void> {
    try {
      // Sanitize input messages
      const sanitizedMessages = messages.map(msg => ({
        ...msg,
        content: sanitizeTextInput(msg.content)
      }));

      // Create request payload
      const payload: ChatRequest = {
        messages: sanitizedMessages,
        model: options.model || this.config.defaultModel,
        stream: true,
        max_tokens: options.max_tokens,
        temperature: options.temperature
      };

      // Create abort controller for request cancellation
      this.controller = new AbortController();
      const signal = this.controller.signal;

      // Send request to OpenRouter API
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Mind Map PWA'
        },
        body: JSON.stringify(payload),
        signal
      });

      // Handle error response
      if (!response.ok) {
        const errorData = await response.json();
        logError('OpenRouter API streaming error:', errorData);
        callback('', true); // Signal completion with empty content
        return;
      }

      // Process the stream
      const reader = response.body?.getReader();
      if (!reader) {
        logError('OpenRouter API streaming error: No reader available');
        callback('', true);
        return;
      }

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (done) {
          // Signal completion
          callback('', true);
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Process the chunk
        const lines = chunk
          .split('\n')
          .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');

        for (const line of lines) {
          try {
            // Extract the JSON data
            const jsonStr = line.replace(/^data: /, '').trim();
            if (!jsonStr) continue;

            const json = JSON.parse(jsonStr) as StreamingChunk;
            
            // Extract content from the chunk
            const content = json.choices[0]?.delta?.content || '';
            
            // Send content to callback
            if (content) {
              callback(content, false);
            }
          } catch (e) {
            logError('Error parsing streaming chunk:', e);
          }
        }
      }
    } catch (error) {
      logError('OpenRouter API streaming unexpected error:', error);
      callback('', true); // Signal completion with empty content
    } finally {
      this.controller = null;
    }
  }

  /**
   * Cancel ongoing request
   */
  cancelRequest(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
      logInfo('OpenRouter API request cancelled');
    }
  }
}

// Export singleton instance
export const openRouterService = new OpenRouterService();

// Export default for testing
export default OpenRouterService;
