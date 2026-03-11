const cron = require('node-cron');
const { User } = require('../models/User');
const { PointsLedger } = require('../models/PointsLedger');
const Team = require('../models/Team');
const logger = require('../config/logger');

/**
 * Build leaderboard HTML email.
 */
const buildLeaderboardEmail = (leaderboard) => {
  const rows = leaderboard
    .slice(0, 20) // top 20
    .map(
      (entry, i) =>
        `<tr style="border-bottom:1px solid #2d3a5a;">
          <td style="padding:10px 15px;color:${i === 0 ? '#facc15' : i === 1 ? '#d1d5db' : i === 2 ? '#d97706' : '#9ca3af'};font-weight:bold;">
            ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
          </td>
          <td style="padding:10px 15px;color:#f1f5f9;font-weight:600;">${entry.name}</td>
          <td style="padding:10px 15px;color:#9ca3af;">${entry.teamName || '—'}</td>
          <td style="padding:10px 15px;color:#818cf8;font-weight:bold;text-align:right;">${entry.totalPoints} pts</td>
        </tr>`
    )
    .join('');

  return `
    <div style="max-width:600px;margin:0 auto;background:#0f0f23;border-radius:12px;overflow:hidden;font-family:Arial,sans-serif;">
      <div style="background:linear-gradient(135deg,#6366f1,#ec4899);padding:25px 30px;">
        <h1 style="margin:0;color:white;font-size:22px;">🏆 Weekly Leaderboard</h1>
        <p style="margin:5px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">TechFest 2026 — Top performers this week</p>
      </div>
      <div style="padding:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:2px solid #6366f1;">
              <th style="padding:10px 15px;color:#818cf8;text-align:left;font-size:12px;text-transform:uppercase;">Rank</th>
              <th style="padding:10px 15px;color:#818cf8;text-align:left;font-size:12px;text-transform:uppercase;">Name</th>
              <th style="padding:10px 15px;color:#818cf8;text-align:left;font-size:12px;text-transform:uppercase;">Team</th>
              <th style="padding:10px 15px;color:#818cf8;text-align:right;font-size:12px;text-transform:uppercase;">Points</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        ${leaderboard.length === 0 ? '<p style="color:#9ca3af;text-align:center;padding:20px;">No points recorded yet — keep pushing!</p>' : ''}
      </div>
      <div style="padding:15px 30px;background:#1a1a2e;text-align:center;">
        <p style="margin:0;color:#6b7280;font-size:12px;">TechFest Management System · Weekly Digest</p>
      </div>
    </div>
  `;
};

/**
 * Start weekly leaderboard cron job.
 * Runs every Monday at 9:00 AM.
 */
const startWeeklyLeaderboardCron = () => {
  // Email sending via cron is disabled — emails must go through the Admin Email module.
  // Uncomment below to re-enable when centralized email scheduling is implemented.
  logger.info('📅 Weekly leaderboard cron is currently disabled (email sending removed).');
};

module.exports = { startWeeklyLeaderboardCron };
