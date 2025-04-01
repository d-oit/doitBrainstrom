import { useState, useCallback, useRef, useEffect } from 'react';
import { openRouterService } from '../services/llm/openRouterService';
import { ChatMessage, ChatOptions } from '../services/llm/types';
import { logError } from '../utils/logger';

interface UseChatStreamOptions {
  onComplete?: (fullResponse: string) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for handling streaming chat responses
 */
export const useChatStream = (options?: UseChatStreamOptions) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to store accumulated response and abort controller
  const responseRef = useRef('');
  const controllerRef = useRef<AbortController | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Stream a chat response from the OpenRouter API
   */
  const streamChatResponse = useCallback(async (
    messages: Omit<ChatMessage, 'timestamp'>[],
    chatOptions?: ChatOptions
  ) => {
    // Reset state
    setIsStreaming(true);
    setStreamedResponse('');
    setError(null);
    responseRef.current = '';

    try {
      // Create abort controller
      controllerRef.current = new AbortController();

      // Stream chat response
      await openRouterService.streamChatRequest(
        messages,
        (chunk, done) => {
          if (done) {
            setIsStreaming(false);
            if (options?.onComplete) {
              options.onComplete(responseRef.current);
            }
            return;
          }

          // Accumulate response
          responseRef.current += chunk;
          setStreamedResponse(responseRef.current);
        },
        chatOptions
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      logError('Error streaming chat response:', err);
      
      if (options?.onError) {
        options.onError(errorMessage);
      }
    } finally {
      setIsStreaming(false);
      controllerRef.current = null;
    }
  }, [options]);

  /**
   * Cancel the streaming response
   */
  const cancelStream = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    
    openRouterService.cancelRequest();
    setIsStreaming(false);
  }, []);

  return {
    streamChatResponse,
    cancelStream,
    isStreaming,
    streamedResponse,
    error
  };
};

export default useChatStream;
