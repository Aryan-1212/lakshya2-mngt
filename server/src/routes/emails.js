const express = require('express');
const { User } = require('../models/User');
const { sendBatchEmails } = require('../utils/resendMailer');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const logger = require('../config/logger');

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('admin'));

/**
 * POST /api/emails/send-bulk
 * Target users by roles, teams, or specific emails.
 */
router.post('/send-bulk', async (req, res, next) => {
  try {
    const { roles, teams, specificEmails, subject, html } = req.body;

    if (!subject || !html) {
      return res.status(400).json({ success: false, message: 'Subject and HTML content are required' });
    }

    let targetEmails = new Set();

    // 1. Add specific emails if provided
    if (specificEmails && Array.isArray(specificEmails)) {
      specificEmails.forEach(email => {
        if (email && email.includes('@')) targetEmails.add(email.trim().toLowerCase());
      });
    }

    // 2. Query users based on roles and teams
    const query = { $or: [] };
    
    if (roles && roles.length > 0) {
      query.$or.push({ role: { $in: roles } });
    }
    
    if (teams && teams.length > 0) {
      query.$or.push({ teamId: { $in: teams } });
      query.$or.push({ secondaryTeamIds: { $in: teams } });
    }

    if (query.$or.length > 0) {
      const users = await User.find(query).select('email').lean();
      users.forEach(u => {
        if (u.email) targetEmails.add(u.email.toLowerCase());
      });
    }

    const emailList = Array.from(targetEmails);

    if (emailList.length === 0) {
      return res.status(400).json({ success: false, message: 'No recipients found matching the criteria' });
    }

    // Send in background to avoid timeout
    sendBatchEmails(emailList, subject, html)
      .then(() => logger.info(`Bulk email sequence finished for ${emailList.length} recipients`))
      .catch(err => logger.error(`Bulk email background task failed: ${err.message}`));

    res.json({ 
      success: true, 
      message: `Mail sending initiated for ${emailList.length} recipients.`,
      recipientCount: emailList.length 
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
