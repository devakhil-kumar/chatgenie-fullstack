import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  // Chat type: 'direct' for 1:1, 'group' for group chats
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },

  // Participants in the chat
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    role: {
      type: String,
      enum: ['member', 'admin', 'owner'],
      default: 'member'
    },
    isActive: { type: Boolean, default: true }
  }],

  // Group chat specific fields
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  avatar: { type: String },

  // Last message reference for quick access
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: { type: Date, default: Date.now },

  // Settings
  settings: {
    muteNotifications: { type: Boolean, default: false },
    allowAIReplies: { type: Boolean, default: true },
    autoDeleteMessages: { type: Number, default: 0 }, // 0 = never, days
  },

  // Group settings
  groupSettings: {
    onlyAdminsCanMessage: { type: Boolean, default: false },
    onlyAdminsCanAddMembers: { type: Boolean, default: false },
    maxMembers: { type: Number, default: 256 },
    isPublic: { type: Boolean, default: false },
    inviteLink: { type: String },
    inviteLinkExpires: { type: Date }
  },

  // Archive and delete
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
chatSchema.index({ participants: 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ 'participants.user': 1, isDeleted: 1 });

// Virtual for active participants
chatSchema.virtual('activeParticipants').get(function() {
  return this.participants.filter(p => p.isActive && !p.leftAt);
});

// Virtual for participant count
chatSchema.virtual('participantCount').get(function() {
  return this.activeParticipants.length;
});

// Virtual for chat display info
chatSchema.virtual('displayInfo').get(function() {
  if (this.type === 'group') {
    return {
      name: this.name || 'Unnamed Group',
      avatar: this.avatar,
      participantCount: this.participantCount
    };
  }
  // For direct chats, display info depends on the other participant
  return null;
});

// Check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.activeParticipants.some(p =>
    p.user.toString() === userId.toString()
  );
};

// Get user's role in chat
chatSchema.methods.getUserRole = function(userId) {
  const participant = this.participants.find(p =>
    p.user.toString() === userId.toString() && p.isActive
  );
  return participant ? participant.role : null;
};

// Check if user can perform admin actions
chatSchema.methods.isAdmin = function(userId) {
  const role = this.getUserRole(userId);
  return role === 'admin' || role === 'owner';
};

// Add participant to chat
chatSchema.methods.addParticipant = async function(userId, addedBy, role = 'member') {
  // Check if user is already a participant
  const existingParticipant = this.participants.find(p =>
    p.user.toString() === userId.toString()
  );

  if (existingParticipant) {
    if (existingParticipant.isActive) {
      throw new Error('User is already a participant');
    }
    // Reactivate if previously left
    existingParticipant.isActive = true;
    existingParticipant.leftAt = undefined;
    existingParticipant.joinedAt = new Date();
  } else {
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
  }

  this.lastActivity = new Date();
  await this.save();
};

// Remove participant from chat
chatSchema.methods.removeParticipant = async function(userId, removedBy) {
  const participantIndex = this.participants.findIndex(p =>
    p.user.toString() === userId.toString() && p.isActive
  );

  if (participantIndex === -1) {
    throw new Error('User is not a participant');
  }

  this.participants[participantIndex].isActive = false;
  this.participants[participantIndex].leftAt = new Date();
  this.lastActivity = new Date();

  await this.save();
};

// Generate invite link for group
chatSchema.methods.generateInviteLink = function(expiresInDays = 7) {
  if (this.type !== 'group') {
    throw new Error('Invite links are only for group chats');
  }

  this.groupSettings.inviteLink = Math.random().toString(36).substring(2, 15);
  this.groupSettings.inviteLinkExpires = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  return this.groupSettings.inviteLink;
};

// Check if invite link is valid
chatSchema.methods.isInviteLinkValid = function(inviteLink) {
  return this.groupSettings.inviteLink === inviteLink &&
         this.groupSettings.inviteLinkExpires > new Date();
};

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;