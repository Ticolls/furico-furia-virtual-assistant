// src/controllers/messageController.ts
import { Request, Response } from "express";
import { messageService } from "../services/messageService";
import { conversationService } from "../services/conversationService";

interface RequestBody {
  message: string;
}

export const messageController = {
    async send(req: Request<{}, {}, RequestBody>, res: Response) {
        const { message } = req.body;
        const sessionId = req.sessionId; 

        if (!message) {
            res.status(400).json({ error: "Mensagem é obrigatória." });
            return
        }

        try {
            await conversationService.addMessage(sessionId, {
                role: 'user',
                content: message
            });

            const conversationHistory = await conversationService.getMessages(sessionId);

            const classification = await messageService.classify(message);
            const answer = await messageService.generateAnswer(classification, conversationHistory);
            
            await conversationService.addMessage(sessionId, {
                role: 'assistant',
                content: answer
            });

            const updatedConversationHistory = await conversationService.getMessages(sessionId);
            
            res.status(200).json({
                id: Date.now().toString(), 
                answer,
                conversationHistory: updatedConversationHistory 
            });
        } catch (e) {
            if (e instanceof Error) {
                console.log(e);
                res.status(400).json({error: e.message});
            } else {
                console.log(e);
                res.status(500).json({error: "Erro interno do servidor."});
            }
        }
    },
    
    async getConversation(req: Request, res: Response) {
        const sessionId = req.sessionId;
        try {
            const conversationHistory = await conversationService.getMessages(sessionId);
            res.status(200).json({ conversationHistory });
        } catch (error) {
            console.error('Error retrieving conversation:', error);
            res.status(500).json({ error: "Erro ao recuperar o histórico da conversa." });
        }
    }
}