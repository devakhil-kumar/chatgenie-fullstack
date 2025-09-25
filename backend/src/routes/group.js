import express from 'express';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { validate, updateChatSchema, addParticipantSchema } from '../utils/validators.js';

const router = express.Router();

// Update group details
router.put('/:groupId', validate(updateChatSchema), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, settings } = req.validatedData;

    const group = await Chat.findById(groupId);

    if (!group || group.type !== 'group' || group.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin
    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Update group
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (settings) {
      group.settings = { ...group.settings, ...settings };
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      data: { group }
    });

  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group'
    });
  }
});

// Add participant to group
router.post('/:groupId/participants', validate(addParticipantSchema), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, role } = req.validatedData;

    const group = await Chat.findById(groupId);

    if (!group || group.type !== 'group' || group.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check permissions
    const userRole = group.getUserRole(req.user._id);
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    // Check if only admins can add members
    if (group.groupSettings.onlyAdminsCanAddMembers && !group.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add members'
      });
    }

    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd || !userToAdd.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a participant
    if (group.isParticipant(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }

    // Check group member limit
    if (group.participantCount >= group.groupSettings.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Group has reached maximum member limit'
      });
    }

    // Add participant
    await group.addParticipant(userId, req.user._id, role);

    res.status(200).json({
      success: true,
      message: 'Participant added successfully'
    });

  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add participant'
    });
  }
});

// Remove participant from group
router.delete('/:groupId/participants/:userId', async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Chat.findById(groupId);

    if (!group || group.type !== 'group' || group.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if the user being removed exists in the group
    if (!group.isParticipant(userId)) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this group'
      });
    }

    const requesterRole = group.getUserRole(req.user._id);
    const targetRole = group.getUserRole(userId);

    // Users can leave themselves
    if (req.user._id.toString() === userId) {
      // Owner cannot leave unless transferring ownership
      if (requesterRole === 'owner') {
        return res.status(400).json({
          success: false,
          message: 'Owner must transfer ownership before leaving'
        });
      }

      await group.removeParticipant(userId, req.user._id);
      return res.status(200).json({
        success: true,
        message: 'Left group successfully'
      });
    }

    // Only admins can remove others
    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Admins cannot remove owner
    if (targetRole === 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Cannot remove group owner'
      });
    }

    // Regular admins cannot remove other admins (only owner can)
    if (targetRole === 'admin' && requesterRole !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owner can remove admins'
      });
    }

    await group.removeParticipant(userId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Participant removed successfully'
    });

  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove participant'
    });
  }
});

// Update participant role
router.put('/:groupId/participants/:userId/role', async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { role } = req.body;

    if (!['member', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const group = await Chat.findById(groupId);

    if (!group || group.type !== 'group' || group.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Only owner can change roles
    if (group.getUserRole(req.user._id) !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only group owner can change roles'
      });
    }

    // Find participant
    const participantIndex = group.participants.findIndex(p =>
      p.user.toString() === userId && p.isActive
    );

    if (participantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Cannot change owner role
    if (group.participants[participantIndex].role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change owner role'
      });
    }

    group.participants[participantIndex].role = role;
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Role updated successfully'
    });

  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role'
    });
  }
});

// Generate invite link
router.post('/:groupId/invite-link', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { expiresInDays = 7 } = req.body;

    const group = await Chat.findById(groupId);

    if (!group || group.type !== 'group' || group.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const inviteLink = group.generateInviteLink(expiresInDays);
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Invite link generated successfully',
      data: {
        inviteLink,
        fullUrl: `${process.env.FRONTEND_URL}/join/${inviteLink}`,
        expiresAt: group.groupSettings.inviteLinkExpires
      }
    });

  } catch (error) {
    console.error('Generate invite link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invite link'
    });
  }
});

// Join group via invite link
router.post('/join/:inviteLink', async (req, res) => {
  try {
    const { inviteLink } = req.params;

    const group = await Chat.findOne({
      'groupSettings.inviteLink': inviteLink,
      type: 'group',
      isDeleted: false
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite link'
      });
    }

    if (!group.isInviteLinkValid(inviteLink)) {
      return res.status(400).json({
        success: false,
        message: 'Invite link has expired'
      });
    }

    // Check if user is already a member
    if (group.isParticipant(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // Check member limit
    if (group.participantCount >= group.groupSettings.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Group has reached maximum member limit'
      });
    }

    await group.addParticipant(req.user._id, null, 'member');

    res.status(200).json({
      success: true,
      message: 'Joined group successfully',
      data: { group }
    });

  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join group'
    });
  }
});

// Get group info from invite link
router.get('/invite/:inviteLink', async (req, res) => {
  try {
    const { inviteLink } = req.params;

    const group = await Chat.findOne({
      'groupSettings.inviteLink': inviteLink,
      type: 'group',
      isDeleted: false
    }).select('name description avatar participantCount groupSettings');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite link'
      });
    }

    if (!group.isInviteLinkValid(inviteLink)) {
      return res.status(400).json({
        success: false,
        message: 'Invite link has expired'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        group: {
          name: group.name,
          description: group.description,
          avatar: group.avatar,
          participantCount: group.participantCount,
          maxMembers: group.groupSettings.maxMembers
        }
      }
    });

  } catch (error) {
    console.error('Get group invite info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group info'
    });
  }
});

export default router;