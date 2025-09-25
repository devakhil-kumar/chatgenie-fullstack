import express from 'express';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { AIService } from '../services/aiService.js';
import { validate, aiReplySchema } from '../utils/validators.js';
import { requirePremium } from '../middleware/auth.js';

const router = express.Router();
const aiService = new AIService();

// Get AI reply suggestions for a message
router.post('/reply-suggestions', validate(aiReplySchema), async (req, res) => {
  try {
    const { messageId, tone, customPrompt } = req.validatedData;

    // Check AI access
    const accessCheck = await aiService.checkAIAccess(req.user);
    if (!accessCheck.hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'AI reply limit exceeded',
        data: accessCheck
      });
    }

    // Get the message
    const message = await Message.findById(messageId)
      .populate('sender', 'username displayName')
      .populate('chat');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user has access to this chat
    const chat = message.chat;
    if (!chat.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if AI replies are allowed in this chat
    if (!chat.settings.allowAIReplies) {
      return res.status(403).json({
        success: false,
        message: 'AI replies are disabled in this chat'
      });
    }

    // Get recent context messages
    const contextMessages = await Message.find({
      chat: chat._id,
      createdAt: { $lt: message.createdAt },
      isDeleted: false
    })
      .populate('sender', 'username displayName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Build context
    const context = contextMessages
      .reverse()
      .map(msg => `${msg.sender.displayName}: ${msg.content.text}`)
      .join('\n');

    // Generate AI suggestions
    const result = await aiService.generateReply(
      message.content.text,
      tone,
      customPrompt,
      context
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate AI suggestions'
      });
    }

    // Increment AI usage for non-premium users
    if (!req.user.isPremium && !req.user.hasUnlockedAI) {
      await req.user.useAIReply();
    }

    // Generate emoji suggestions
    const emojis = await aiService.generateEmojis(message.content.text);

    res.status(200).json({
      success: true,
      message: 'AI suggestions generated successfully',
      data: {
        suggestions: result.suggestions,
        emojis,
        originalMessage: {
          id: message._id,
          text: message.content.text,
          sender: message.sender.displayName
        },
        usage: result.usage,
        remainingUses: accessCheck.remainingUses
      }
    });

  } catch (error) {
    console.error('AI reply error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate AI suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Send AI-generated message
router.post('/send-reply', async (req, res) => {
  try {
    const { chatId, originalMessageId, suggestedText, tone } = req.body;

    if (!chatId || !originalMessageId || !suggestedText) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID, original message ID, and suggested text are required'
      });
    }

    // Verify chat access
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isParticipant(req.user._id) || chat.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify original message
    const originalMessage = await Message.findById(originalMessageId);
    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: 'Original message not found'
      });
    }

    // Create AI-generated message
    const messageData = {
      chat: chatId,
      sender: req.user._id,
      content: {
        text: suggestedText,
        type: 'ai_suggestion'
      },
      isAIGenerated: true,
      aiTone: tone || 'neutral',
      originalMessage: originalMessageId,
      replyTo: originalMessageId
    };

    const message = new Message(messageData);
    await message.save();

    // Update chat
    chat.lastMessage = message._id;
    chat.lastActivity = new Date();
    await chat.save();

    // Populate for response
    await message.populate('sender', 'username displayName avatar');
    await message.populate('originalMessage', 'content.text sender');

    res.status(201).json({
      success: true,
      message: 'AI-generated message sent successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Send AI reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send AI-generated message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get AI usage statistics for user
router.get('/usage', async (req, res) => {
  try {
    const accessInfo = await aiService.checkAIAccess(req.user);

    const stats = {
      aiRepliesUsed: req.user.aiRepliesUsed,
      aiRepliesLimit: req.user.aiRepliesLimit,
      remainingUses: accessInfo.remainingUses,
      isPremium: req.user.isPremium,
      hasUnlockedAI: req.user.hasUnlockedAI,
      referralCount: req.user.referralCount,
      premiumExpiresAt: req.user.premiumExpiresAt,
      hasAccess: accessInfo.hasAccess
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get AI usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI usage statistics'
    });
  }
});

// Get available AI tones and descriptions
router.get('/tones', async (req, res) => {
  try {
    const tones = [
      {
        name: 'neutral',
        displayName: 'Neutral',
        description: 'Balanced and friendly responses',
        emoji: '😊'
      },
      {
        name: 'funny',
        displayName: 'Funny',
        description: 'Humorous and witty responses',
        emoji: '😂'
      },
      {
        name: 'romantic',
        displayName: 'Romantic',
        description: 'Affectionate and loving responses',
        emoji: '💕'
      },
      {
        name: 'formal',
        displayName: 'Formal',
        description: 'Professional and polite responses',
        emoji: '🤝'
      },
      {
        name: 'casual',
        displayName: 'Casual',
        description: 'Relaxed and conversational responses',
        emoji: '👋'
      },
      {
        name: 'professional',
        displayName: 'Professional',
        description: 'Business-appropriate responses',
        emoji: '💼'
      }
    ];

    res.status(200).json({
      success: true,
      data: { tones }
    });

  } catch (error) {
    console.error('Get AI tones error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI tones'
    });
  }
});

// Admin: Get AI service health status
router.get('/health', requirePremium, async (req, res) => {
  try {
    // Check if AI service is responding
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date(),
      apiConfigured: !!process.env.AI_API_KEY,
      encryptionEnabled: !!process.env.AI_ENCRYPTION_KEY,
      model: process.env.AI_MODEL || 'gpt-3.5-turbo'
    };

    // Try a simple API call to check connectivity
    try {
      await aiService.generateReply('Hello', 'neutral');
      healthCheck.apiConnectivity = 'healthy';
    } catch (error) {
      healthCheck.apiConnectivity = 'error';
      healthCheck.apiError = error.message;
    }

    res.status(200).json({
      success: true,
      data: healthCheck
    });

  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check AI service health'
    });
  }
});

export default router;