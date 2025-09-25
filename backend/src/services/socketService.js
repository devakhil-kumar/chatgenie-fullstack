import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import { setUserOnline, setUserOffline, setTypingIndicator, getTypingUsers } from '../config/redis.js';

const connectedUsers = new Map(); // socketId -> userId mapping

export const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password -phoneOTP -emailOTP');

      if (!user || !user.isActive) {
        return next(new Error('Invalid token or user not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`🔌 User ${socket.user.username} connected (${socket.id})`);

    try {
      // Store user connection
      connectedUsers.set(socket.id, socket.userId);

      // Set user online in Redis
      await setUserOnline(socket.userId, socket.id);

      // Update user's online status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: true,
        lastSeen: new Date()
      });

      // Join user to their personal room
      socket.join(`user:${socket.userId}`);

      // Join user to their chat rooms
      const userChats = await Chat.find({
        'participants.user': socket.userId,
        'participants.isActive': true,
        isDeleted: false
      });

      userChats.forEach(chat => {
        socket.join(`chat:${chat._id}`);
      });

      // Emit online status to user's contacts
      socket.broadcast.emit('user_online', {
        userId: socket.userId,
        username: socket.user.username
      });

      // Handle joining a chat room
      socket.on('join_chat', async (data) => {
        try {
          const { chatId } = data;

          const chat = await Chat.findById(chatId);
          if (!chat || !chat.isParticipant(socket.userId)) {
            socket.emit('error', { message: 'Chat not found or access denied' });
            return;
          }

          socket.join(`chat:${chatId}`);

          // Send recent messages
          const messages = await Message.find({
            chat: chatId,
            isDeleted: false,
            $nor: [{ deletedFor: socket.userId }]
          })
            .populate('sender', 'username displayName avatar')
            .populate('replyTo', 'content.text sender')
            .sort({ createdAt: -1 })
            .limit(50);

          socket.emit('chat_messages', {
            chatId,
            messages: messages.reverse()
          });

        } catch (error) {
          console.error('Join chat error:', error);
          socket.emit('error', { message: 'Failed to join chat' });
        }
      });

      // Handle leaving a chat room
      socket.on('leave_chat', (data) => {
        const { chatId } = data;
        socket.leave(`chat:${chatId}`);
      });

      // Handle sending messages
      socket.on('send_message', async (data) => {
        try {
          const { chatId, content, replyTo, aiTone } = data;

          // Validate chat access
          const chat = await Chat.findById(chatId);
          if (!chat || !chat.isParticipant(socket.userId)) {
            socket.emit('error', { message: 'Chat not found or access denied' });
            return;
          }

          // Create message
          const messageData = {
            chat: chatId,
            sender: socket.userId,
            content,
            replyTo,
            aiTone
          };

          const message = new Message(messageData);
          await message.save();

          // Populate message for response
          await message.populate('sender', 'username displayName avatar');
          if (replyTo) {
            await message.populate('replyTo', 'content.text sender');
          }

          // Update chat last activity and message
          chat.lastMessage = message._id;
          chat.lastActivity = new Date();
          await chat.save();

          // Emit to all participants
          io.to(`chat:${chatId}`).emit('new_message', {
            chatId,
            message
          });

          // Send push notifications to offline users
          const offlineParticipants = await User.find({
            _id: { $in: chat.activeParticipants.map(p => p.user) },
            _id: { $ne: socket.userId },
            isOnline: false
          });

          // TODO: Implement push notifications for offline users

        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', async (data) => {
        try {
          const { chatId } = data;

          const chat = await Chat.findById(chatId);
          if (!chat || !chat.isParticipant(socket.userId)) return;

          await setTypingIndicator(chatId, socket.userId, true);

          socket.to(`chat:${chatId}`).emit('user_typing', {
            chatId,
            userId: socket.userId,
            username: socket.user.username,
            isTyping: true
          });

        } catch (error) {
          console.error('Typing start error:', error);
        }
      });

      socket.on('typing_stop', async (data) => {
        try {
          const { chatId } = data;

          const chat = await Chat.findById(chatId);
          if (!chat || !chat.isParticipant(socket.userId)) return;

          await setTypingIndicator(chatId, socket.userId, false);

          socket.to(`chat:${chatId}`).emit('user_typing', {
            chatId,
            userId: socket.userId,
            username: socket.user.username,
            isTyping: false
          });

        } catch (error) {
          console.error('Typing stop error:', error);
        }
      });

      // Handle message read receipts
      socket.on('mark_read', async (data) => {
        try {
          const { messageIds } = data;

          if (!Array.isArray(messageIds)) return;

          const messages = await Message.find({
            _id: { $in: messageIds },
            sender: { $ne: socket.userId }
          });

          for (const message of messages) {
            if (!message.isReadBy(socket.userId)) {
              await message.markAsRead(socket.userId);

              // Notify sender
              io.to(`user:${message.sender}`).emit('message_read', {
                messageId: message._id,
                readBy: socket.userId,
                readAt: new Date()
              });
            }
          }

        } catch (error) {
          console.error('Mark read error:', error);
        }
      });

      // Handle message reactions
      socket.on('add_reaction', async (data) => {
        try {
          const { messageId, emoji } = data;

          const message = await Message.findById(messageId);
          if (!message) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }

          // Check if user has access to this message
          const chat = await Chat.findById(message.chat);
          if (!chat || !chat.isParticipant(socket.userId)) {
            socket.emit('error', { message: 'Access denied' });
            return;
          }

          await message.addReaction(socket.userId, emoji);

          // Emit to all chat participants
          io.to(`chat:${message.chat}`).emit('reaction_added', {
            messageId,
            userId: socket.userId,
            emoji,
            reactions: message.reactions
          });

        } catch (error) {
          console.error('Add reaction error:', error);
          socket.emit('error', { message: 'Failed to add reaction' });
        }
      });

      socket.on('remove_reaction', async (data) => {
        try {
          const { messageId } = data;

          const message = await Message.findById(messageId);
          if (!message) return;

          const chat = await Chat.findById(message.chat);
          if (!chat || !chat.isParticipant(socket.userId)) return;

          await message.removeReaction(socket.userId);

          io.to(`chat:${message.chat}`).emit('reaction_removed', {
            messageId,
            userId: socket.userId,
            reactions: message.reactions
          });

        } catch (error) {
          console.error('Remove reaction error:', error);
        }
      });

      // Handle message editing
      socket.on('edit_message', async (data) => {
        try {
          const { messageId, newContent } = data;

          const message = await Message.findById(messageId);
          if (!message) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }

          // Only sender can edit their own messages
          if (message.sender.toString() !== socket.userId) {
            socket.emit('error', { message: 'Can only edit your own messages' });
            return;
          }

          // Can't edit messages older than 48 hours
          const hoursSinceCreated = (Date.now() - message.createdAt.getTime()) / (1000 * 60 * 60);
          if (hoursSinceCreated > 48) {
            socket.emit('error', { message: 'Cannot edit messages older than 48 hours' });
            return;
          }

          await message.editContent(newContent);

          io.to(`chat:${message.chat}`).emit('message_edited', {
            messageId,
            newContent,
            editedAt: message.editedAt
          });

        } catch (error) {
          console.error('Edit message error:', error);
          socket.emit('error', { message: 'Failed to edit message' });
        }
      });

      // Handle message deletion
      socket.on('delete_message', async (data) => {
        try {
          const { messageId, deleteForEveryone = false } = data;

          const message = await Message.findById(messageId);
          if (!message) return;

          const chat = await Chat.findById(message.chat);
          if (!chat || !chat.isParticipant(socket.userId)) return;

          // Only sender can delete for everyone
          if (deleteForEveryone && message.sender.toString() !== socket.userId) {
            socket.emit('error', { message: 'Can only delete your own messages for everyone' });
            return;
          }

          await message.deleteMessage(socket.userId, deleteForEveryone);

          if (deleteForEveryone) {
            io.to(`chat:${message.chat}`).emit('message_deleted', {
              messageId,
              deletedForEveryone: true
            });
          } else {
            socket.emit('message_deleted', {
              messageId,
              deletedForEveryone: false
            });
          }

        } catch (error) {
          console.error('Delete message error:', error);
        }
      });

      // Handle presence updates
      socket.on('update_presence', async (data) => {
        try {
          const { status } = data; // 'online', 'away', 'busy'

          await User.findByIdAndUpdate(socket.userId, {
            lastSeen: new Date()
          });

          // Broadcast presence to contacts
          socket.broadcast.emit('presence_updated', {
            userId: socket.userId,
            status,
            lastSeen: new Date()
          });

        } catch (error) {
          console.error('Update presence error:', error);
        }
      });

    } catch (error) {
      console.error('Socket connection error:', error);
    }

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`📴 User ${socket.user.username} disconnected (${socket.id})`);

      try {
        // Remove from connected users
        connectedUsers.delete(socket.id);

        // Set user offline in Redis
        await setUserOffline(socket.userId);

        // Update user's online status
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date()
        });

        // Clear typing indicators
        const userChats = await Chat.find({
          'participants.user': socket.userId,
          'participants.isActive': true
        });

        for (const chat of userChats) {
          await setTypingIndicator(chat._id.toString(), socket.userId, false);
        }

        // Emit offline status
        socket.broadcast.emit('user_offline', {
          userId: socket.userId,
          lastSeen: new Date()
        });

      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });

  // Utility function to emit to specific user
  io.emitToUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  // Utility function to emit to specific chat
  io.emitToChat = (chatId, event, data) => {
    io.to(`chat:${chatId}`).emit(event, data);
  };

  return io;
};