import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import { validate, createChatSchema, sendMessageSchema, editMessageSchema } from '../utils/validators.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, audio, and documents
    const allowedTypes = [
      'image/', 'video/', 'audio/',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument',
      'text/plain'
    ];

    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Configure S3 client (will use environment variables)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Get all chats for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let query = {
      'participants.user': req.user._id,
      'participants.isActive': true,
      isDeleted: false
    };

    if (type && ['direct', 'group'].includes(type)) {
      query.type = type;
    }

    const chats = await Chat.find(query)
      .populate({
        path: 'participants.user',
        select: 'username displayName avatar isOnline lastSeen'
      })
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt',
        populate: {
          path: 'sender',
          select: 'username displayName'
        }
      })
      .sort({ lastActivity: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Format chat list for response
    const formattedChats = chats.map(chat => {
      const otherParticipants = chat.activeParticipants.filter(p =>
        p.user._id.toString() !== req.user._id.toString()
      );

      let chatInfo;
      if (chat.type === 'direct') {
        const otherUser = otherParticipants[0]?.user;
        chatInfo = {
          name: otherUser?.displayName || 'Unknown User',
          avatar: otherUser?.avatar || '',
          isOnline: otherUser?.isOnline || false,
          lastSeen: otherUser?.lastSeen
        };
      } else {
        chatInfo = {
          name: chat.name,
          avatar: chat.avatar,
          participantCount: chat.participantCount,
          description: chat.description
        };
      }

      return {
        _id: chat._id,
        type: chat.type,
        ...chatInfo,
        lastMessage: chat.lastMessage,
        lastActivity: chat.lastActivity,
        settings: chat.settings,
        unreadCount: 0 // TODO: Calculate unread count
      };
    });

    const total = await Chat.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        chats: formattedChats,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new chat (direct or group)
router.post('/', validate(createChatSchema), async (req, res) => {
  try {
    const { type, participants, name, description } = req.validatedData;

    // Add current user to participants if not already included
    const allParticipants = [...new Set([...participants, req.user._id.toString()])];

    // For direct chat, ensure only 2 participants
    if (type === 'direct' && allParticipants.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Direct chat must have exactly 2 participants'
      });
    }

    // Check if direct chat already exists
    if (type === 'direct') {
      const existingChat = await Chat.findOne({
        type: 'direct',
        'participants.user': { $all: allParticipants },
        'participants.isActive': true,
        isDeleted: false
      });

      if (existingChat) {
        return res.status(400).json({
          success: false,
          message: 'Direct chat already exists',
          data: { chatId: existingChat._id }
        });
      }
    }

    // Validate all participants exist
    const users = await User.find({
      _id: { $in: allParticipants },
      isActive: true
    });

    if (users.length !== allParticipants.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more participants not found'
      });
    }

    // Create chat
    const chatData = {
      type,
      participants: allParticipants.map(userId => ({
        user: userId,
        role: userId === req.user._id.toString() ? 'owner' : 'member'
      })),
      name: type === 'group' ? name : undefined,
      description: type === 'group' ? description : undefined
    };

    const chat = new Chat(chatData);
    await chat.save();

    // Populate for response
    await chat.populate('participants.user', 'username displayName avatar');

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: { chat }
    });

  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get chat details
router.get('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate('participants.user', 'username displayName avatar isOnline lastSeen')
      .populate('lastMessage');

    if (!chat || !chat.isParticipant(req.user._id) || chat.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { chat }
    });

  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get chat messages
router.get('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Verify chat access
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isParticipant(req.user._id) || chat.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    let query = {
      chat: chatId,
      isDeleted: false,
      $nor: [{ deletedFor: req.user._id }]
    };

    // If 'before' timestamp is provided, get messages before that time
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username displayName avatar')
      .populate('replyTo', 'content.text sender')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Message.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasMore: total > pageNum * limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Send message
router.post('/:chatId/messages', upload.array('files', 5), validate(sendMessageSchema), async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, replyTo, aiTone } = req.validatedData;

    // Verify chat access
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isParticipant(req.user._id) || chat.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    let messageData = {
      chat: chatId,
      sender: req.user._id,
      content,
      replyTo,
      aiTone
    };

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const file = req.files[0]; // Handle first file for now

      // Determine content type
      if (file.mimetype.startsWith('image/')) {
        messageData.content.type = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        messageData.content.type = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        messageData.content.type = 'audio';
      } else {
        messageData.content.type = 'file';
      }

      // Upload to S3 (if configured)
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `chat-media/${chatId}/${fileName}`,
          Body: file.buffer,
          ContentType: file.mimetype
        };

        try {
          await s3Client.send(new PutObjectCommand(uploadParams));
          messageData.media = {
            url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/chat-media/${chatId}/${fileName}`,
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          };
        } catch (uploadError) {
          console.error('S3 upload error:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload file'
          });
        }
      } else {
        // Save locally if S3 not configured
        messageData.media = {
          url: `/uploads/${Date.now()}-${file.originalname}`,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        };
      }
    }

    // Create message
    const message = new Message(messageData);
    await message.save();

    // Update chat
    chat.lastMessage = message._id;
    chat.lastActivity = new Date();
    await chat.save();

    // Populate for response
    await message.populate('sender', 'username displayName avatar');
    if (replyTo) {
      await message.populate('replyTo', 'content.text sender');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Edit message
router.put('/messages/:messageId', validate(editMessageSchema), async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.validatedData;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can edit
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Can only edit your own messages'
      });
    }

    // Can't edit messages older than 48 hours
    const hoursSinceCreated = (Date.now() - message.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreated > 48) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit messages older than 48 hours'
      });
    }

    await message.editContent(content);

    res.status(200).json({
      success: true,
      message: 'Message edited successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone = false } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify access to chat
    const chat = await Chat.findById(message.chat);
    if (!chat || !chat.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only sender can delete for everyone
    if (deleteForEveryone && message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Can only delete your own messages for everyone'
      });
    }

    await message.deleteMessage(req.user._id, deleteForEveryone);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: { deleteForEveryone }
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add reaction to message
router.post('/messages/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify access to chat
    const chat = await Chat.findById(message.chat);
    if (!chat || !chat.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await message.addReaction(req.user._id, emoji);

    res.status(200).json({
      success: true,
      message: 'Reaction added successfully',
      data: { reactions: message.reactions }
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Remove reaction from message
router.delete('/messages/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const chat = await Chat.findById(message.chat);
    if (!chat || !chat.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await message.removeReaction(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Reaction removed successfully',
      data: { reactions: message.reactions }
    });

  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;