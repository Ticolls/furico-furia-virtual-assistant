// src/store/conversationStore.ts
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../cache/redis';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  messages: Message[];
  lastActive: Date;
}

class ConversationService {
  private readonly EXPIRY_TIME = 24 * 60 * 60;

  async getOrCreateConversation(sessionId: string): Promise<Conversation> {
    const conversationKey = `conversation:${sessionId}`;
    
    const storedConversation = await redisClient.get(conversationKey);
    
    if (storedConversation) {
      const conversation: Conversation = JSON.parse(storedConversation);
      conversation.lastActive = new Date();
      
      await redisClient.set(conversationKey, JSON.stringify(conversation), {
        EX: this.EXPIRY_TIME
      });
      
      return conversation;
    } else {
      const newConversation: Conversation = {
        id: sessionId,
        messages: [],
        lastActive: new Date()
      };
      
      await redisClient.set(conversationKey, JSON.stringify(newConversation), {
        EX: this.EXPIRY_TIME
      });
      
      return newConversation;
    }
  }

  async addMessage(sessionId: string, message: Omit<Message, 'timestamp'>): Promise<Message> {
    const conversation = await this.getOrCreateConversation(sessionId);
    
    const newMessage: Message = {
      ...message,
      timestamp: new Date()
    };
    
    conversation.messages.push(newMessage);
    conversation.lastActive = new Date();
    
    const conversationKey = `conversation:${sessionId}`;
    await redisClient.set(conversationKey, JSON.stringify(conversation), {
      EX: this.EXPIRY_TIME
    });
    
    return newMessage;
  }


  async getMessages(sessionId: string): Promise<Message[]> {
    const conversationKey = `conversation:${sessionId}`;
    const storedConversation = await redisClient.get(conversationKey);
    
    if (storedConversation) {
      const conversation: Conversation = JSON.parse(storedConversation);
      return conversation.messages;
    }
    
    return [];
  }

  generateSessionId(): string {
    return uuidv4();
  }
}

export const conversationService = new ConversationService();