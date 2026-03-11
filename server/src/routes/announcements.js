const express = require('express');
const { Announcement, AnnouncementRead } = require('../models/Announcement');
const { User } = require('../models/EnhancedUser');
const { verifyToken } = require('../middleware/auth');
const { requireRole, blockFacultyWrite } = require('../middleware/rbac');
const { validate, announcementSchema } = require('../validators/schemas');
const { sendBatchEmails } = require('../utils/resendMailer');
const logger = require('../config/logger');

const router = express.Router();
router.use(verifyToken);

// GET /api/announcements
router.get('/', async (req, res, next) => {
  try {
    const { role, teamId, id: userId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let filter = {};
    // Admin/Faculty/TL see all; members/volunteers see scoped
    if (role === 'volunteer' || role === 'member' || role === 'campus_ambassador') {
      filter = {
        $and: [
          {
            $or: [
              { scope: 'global' },
              { scope: 'team', teamId },
              { scope: 'role', targetRoles: { $in: [role] } },
            ],
          },
          { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
        ],
      };
    } else if (role === 'teamleader') {
      filter = {
        $and: [
          { $or: [{ scope: 'global' }, { scope: 'team', teamId }, { scope: 'role', targetRoles: role }] },
          { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
        ],
      };
    } else {
      filter = { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] };
    }

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate('createdBy', 'name role')
        .populate('teamId', 'name')
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Announcement.countDocuments(filter),
    ]);

    // Attach read status
    const readRecords = await AnnouncementRead.find({
      userId,
      announcementId: { $in: announcements.map((a) => a._id) },
    });
    const readSet = new Set(readRecords.map((r) => r.announcementId.toString()));

    const result = announcements.map((a) => ({
      ...a.toObject(),
      isRead: readSet.has(a._id.toString()),
    }));

    res.json({ success: true, announcements: result, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/announcements/:id
router.get('/:id', async (req, res, next) => {
  try {
    const ann = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name role')
      .populate('teamId', 'name');
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, announcement: ann });
  } catch (err) {
    next(err);
  }
});

// POST /api/announcements/:id/read — mark as read
router.post('/:id/read', async (req, res, next) => {
  try {
    await AnnouncementRead.findOneAndUpdate(
      { userId: req.user.id, announcementId: req.params.id },
      { readAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});


// POST /api/announcements — Admin or TL
// Admin = global only (can still pick global/team/role)
// TL = team only (forced to their own team, scope = 'team')
router.post('/', requireRole('admin', 'teamleader'), blockFacultyWrite, validate(announcementSchema), async (req, res, next) => {
  try {
    const body = { ...req.body, createdBy: req.user.id };

    // Scope enforcement
    if (req.user.role === 'teamleader') {
      // TL can only create team-scoped announcements for their own team
      body.scope = 'team';
      body.teamId = req.user.teamId;
    }
    // Admin can select any scope (global, team, role)
    if (body.teamId === '') {
      body.teamId = null;
    }
    if (body.expiresAt === '') {
      body.expiresAt = null;
    }

    const ann = await Announcement.create(body);
    await ann.populate('createdBy', 'name');

    // Handle Email Notifications
    if (ann.sendEmail && ann.scope !== 'global') {
      // Create background task for email sending
      (async () => {
        try {
          let recipientEmails = [];

          if (ann.scope === 'team' && ann.teamId) {
            const users = await User.find({ 
              $or: [
                { teamId: ann.teamId },
                { secondaryTeamIds: ann.teamId }
              ],
              isActive: true 
            }).select('email').lean();
            recipientEmails = users.map(u => u.email).filter(Boolean);
          } else if (ann.scope === 'role' && ann.targetRoles?.length > 0) {
            // Exclude member and campus_ambassador as per user requirement
            const filteredRoles = ann.targetRoles.filter(r => 
              r !== 'member' && r !== 'campus_ambassador'
            );

            if (filteredRoles.length > 0) {
              const users = await User.find({ 
                role: { $in: filteredRoles },
                isActive: true 
              }).select('email').lean();
              recipientEmails = users.map(u => u.email).filter(Boolean);
            }
          }

          if (recipientEmails.length > 0) {
            const subject = `📢 Announcement: ${ann.title}`;
            const html = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #4f46e5; margin-top: 0;">${ann.title}</h2>
                <div style="color: #334155; line-height: 1.6; margin: 20px 0;">
                  ${ann.body.replace(/\n/g, '<br>')}
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
                  Sent by ${req.user.name || 'Admin'} via TechFest Management Portal<br>
                  ${new Date().toLocaleString()}
                </p>
              </div>
            `;

            logger.info(`Starting background email notifications for announcement ${ann._id} to ${recipientEmails.length} recipients`);
            await sendBatchEmails(recipientEmails, subject, html);
          } else {
            logger.info(`No eligible recipients for announcement ${ann._id} email notification (Scope: ${ann.scope})`);
          }
        } catch (err) {
          logger.error(`Failed to send announcement emails: ${err.message}`);
        }
      })();
    } else if (ann.sendEmail && ann.scope === 'global') {
      logger.warn(`Email notification skipped for global announcement ${ann._id}`);
    }

    res.status(201).json({ success: true, announcement: ann });
  } catch (err) {
    next(err);
  }
});

// PUT /api/announcements/:id
router.put('/:id', requireRole('admin', 'teamleader'), blockFacultyWrite, async (req, res, next) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    if (req.user.role === 'teamleader' && ann.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own announcements' });
    }
    const allowed = ['title', 'body', 'scope', 'teamId', 'targetRoles', 'pinned', 'expiresAt', 'sendEmail'];
    const update = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    
    if (update.teamId === '') {
      update.teamId = null;
    }
    if (update.expiresAt === '') {
      update.expiresAt = null;
    }

    const updated = await Announcement.findByIdAndUpdate(req.params.id, update, { new: true }).populate('createdBy', 'name').populate('teamId', 'name');
    res.json({ success: true, announcement: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', requireRole('admin', 'teamleader'), blockFacultyWrite, async (req, res, next) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    
    if (req.user.role === 'teamleader' && ann.createdBy.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'You can only delete your own announcements' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
