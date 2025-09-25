import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Basic message info
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Message content
  content: {
    text: { type: String, trim: true },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file', 'location', 'contact', 'ai_suggestion'],
      default: 'text'
    }
  },

  // Media attachments
  media: {
    url: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    thumbnail: { type: String }, // For videos/images
    duration: { type: Number }, // For audio/video
    width: { type: Number }, // For images/videos
    height: { type: Number } // For images/videos
  },

  // Location data
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String }
  },

  // Contact data
  contact: {
    name: { type: String },
    phoneNumber: { type: String },
    email: { type: String }
  },

  // AI-related fields
  isAIGenerated: { type: Boolean, default: false },
  aiPrompt: { type: String }, // The prompt used to generate this message
  aiTone: {
    type: String,
    enum: ['neutral', 'funny', 'romantic', 'formal', 'casual', 'professional'],
    default: 'neutral'
  },
  originalMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }, // Reference to the message this AI reply is responding to

  // Reply/Thread info
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  threadId: { type: String }, // For threaded conversations

  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },

  // Read receipts
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: { type: Date, default: Date.now }
  }],

  // Reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],

  // Message actions
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  editHistory: [{
    content: { type: String },
    editedAt: { type: Date, default: Date.now }
  }],

  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }], // Users who deleted this message (for delete for me)

  // Delivery info
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: { type: Date, default: Date.now }
  }],

  // Message encryption (for future e2e encryption)
  encrypted: { type: Boolean, default: false },
  encryptionKey: { type: String },

  // Scheduled messages
  scheduledFor: { type: Date },
  isScheduled: { type: Boolean, default: false },

  // Auto-delete
  expiresAt: { type: Date },
  autoDelete: { type: Boolean, default: false }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'readBy.user': 1 });
messageSchema.index({ replyTo: 1 });
messageSchema.index({ scheduledFor: 1, isScheduled: 1 });
messageSchema.index({ expiresAt: 1 });
messageSchema.index({ isDeleted: 1 });

// TTL index for auto-deletion
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for message preview
messageSchema.virtual('preview').get(function() {
  if (this.isDeleted) return 'This message was deleted';

  switch (this.content.type) {
    case 'text':
      return this.content.text || '';
    case 'image':
      return '📷 Image';
    case 'video':
      return '🎥 Video';
    case 'audio':
      return '🎵 Audio';
    case 'file':
      return `📄 ${this.media.filename || 'File'}`;
    case 'location':
      return '📍 Location';
    case 'contact':
      return `👤 ${this.contact.name || 'Contact'}`;
    case 'ai_suggestion':
      return '🤖 AI Suggestion';
    default:
      return 'Message';
  }
});

// Check if message is read by user
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(r => r.user.toString() === userId.toString());
};

// Mark message as read by user
messageSchema.methods.markAsRead = async function(userId) {
  if (this.isReadBy(userId)) return;

  this.readBy.push({
    user: userId,
    readAt: new Date()
  });

  await this.save();
};

// Add reaction to message
messageSchema.methods.addReaction = async function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r =>
    r.user.toString() !== userId.toString()
  );

  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji,
    createdAt: new Date()
  });

  await this.save();
};

// Remove reaction from message
messageSchema.methods.removeReaction = async function(userId) {
  this.reactions = this.reactions.filter(r =>
    r.user.toString() !== userId.toString()
  );

  await this.save();
};

// Edit message content
messageSchema.methods.editContent = async function(newContent) {
  // Save to edit history
  if (this.content.text) {
    this.editHistory.push({
      content: this.content.text,
      editedAt: new Date()
    });
  }

  this.content.text = newContent;
  this.isEdited = true;
  this.editedAt = new Date();

  await this.save();
};

// Delete message
messageSchema.methods.deleteMessage = async function(userId, deleteForEveryone = false) {
  if (deleteForEveryone) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.content.text = '';
  } else {
    // Delete for specific user only
    if (!this.deletedFor.includes(userId)) {
      this.deletedFor.push(userId);
    }
  }

  await this.save();
};

// Check if message is deleted for user
messageSchema.methods.isDeletedFor = function(userId) {
  return this.isDeleted || this.deletedFor.includes(userId);
};

// Schedule message for auto-deletion
messageSchema.methods.scheduleAutoDelete = async function(hours = 24) {
  this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  this.autoDelete = true;
  await this.save();
};

const Message = mongoose.model('Message', messageSchema);

export default Message;