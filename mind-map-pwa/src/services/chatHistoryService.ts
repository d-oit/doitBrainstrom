// src/services/chatHistoryService.ts
import { logInfo, logError } from '../utils/logger';
import { saveChatMessage, getChatMessagesByConversation } from '../utils/indexedDB/dbService';
import { ChatMessageRecord } from '../utils/indexedDB/config';
import { generateId } from '../utils/MindMapDataModel';

/**
 * Save a chat message to IndexedDB
 * @param message The chat message to save
 */
export const saveChatMessageToHistory = async (
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, any>
): Promise<boolean> => {
  try {
    logInfo('Saving chat message to history');
    
    const messageRecord: ChatMessageRecord = {
      id: generateId(),
      conversationId,
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    return await saveChatMessage(messageRecord);
  } catch (error) {
    logError('Error saving chat message to history:', error);
    return false;
  }
};

/**
 * Get chat history for a conversation
 * @param conversationId The ID of the conversation
 * @returns Array of chat messages sorted by timestamp
 */
export const getChatHistory = async (conversationId: string): Promise<ChatMessageRecord[]> => {
  try {
    logInfo('Getting chat history for conversation:', { conversationId });
    
    const messages = await getChatMessagesByConversation(conversationId);
    
    // Sort messages by timestamp
    return messages.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  } catch (error) {
    logError('Error getting chat history:', error);
    return [];
  }
};

/**
 * Create a new conversation and return its ID
 */
export const createNewConversation = (): string => {
  const conversationId = generateId();
  logInfo('Created new conversation:', { conversationId });
  return conversationId;
};

/**
 * Add a system message to a conversation
 * @param conversationId The ID of the conversation
 * @param content The system message content
 */
export const addSystemMessage = async (
  conversationId: string,
  content: string
): Promise<boolean> => {
  return await saveChatMessageToHistory(conversationId, 'system', content);
};

/**
 * Add a user message to a conversation
 * @param conversationId The ID of the conversation
 * @param content The user message content
 */
export const addUserMessage = async (
  conversationId: string,
  content: string
): Promise<boolean> => {
  return await saveChatMessageToHistory(conversationId, 'user', content);
};

/**
 * Add an assistant message to a conversation
 * @param conversationId The ID of the conversation
 * @param content The assistant message content
 */
export const addAssistantMessage = async (
  conversationId: string,
  content: string
): Promise<boolean> => {
  return await saveChatMessageToHistory(conversationId, 'assistant', content);
};
