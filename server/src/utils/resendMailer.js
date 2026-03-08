const { Resend } = require('resend');
const logger = require('../config/logger');

let resendClient = null;

const getClient = () => {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    logger.warn('RESEND_API_KEY not set — email sending disabled.');
    return null;
  }
  resendClient = new Resend(key);
  return resendClient;
};

/**
 * Send an email using Resend.
 * @param {Object} opts
 * @param {string|string[]} opts.to - Recipient(s)
 * @param {string} opts.subject - Email subject
 * @param {string} opts.html - HTML content
 * @returns {Promise<{data: any, error: any}>}
 */
const sendEmail = async ({ to, subject, html }) => {
  const client = getClient();
  if (!client) return { data: null, error: { message: 'Resend client not initialized' } };

  const from = 'noreply@mail.lakshya-mngt.online';
  const textFallback = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  try {
    const response = await client.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: textFallback,
    });
    return response;
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
};

/**
 * Send emails to multiple recipients individually with full logging and summary.
 * @param {string[]} emailList
 * @param {string} subject
 * @param {string} html
 * @returns {Promise<Object>} Summary of the operation
 */
const sendBatchEmails = async (emailList, subject, html) => {
  const summary = {
    successCount: 0,
    failureCount: 0,
    failures: []
  };

  if (!emailList || !emailList.length) {
    logger.warn('sendBatchEmails called with empty list');
    return summary;
  }

  logger.info(`Starting batch send to ${emailList.length} recipients...`);

  // Use for...of loop with await as requested for maximum reliability/debugging per email
  for (const email of emailList) {
    const { data, error } = await sendEmail({ to: email, subject, html });

    if (error) {
      summary.failureCount++;
      summary.failures.push({ email, error: error.message });
      logger.error(`[FAIL] Recipient: ${email} | Error: ${error.message}${error.statusCode ? ` | Status: ${error.statusCode}` : ''}`);
    } else {
      summary.successCount++;
      logger.info(`[SUCCESS] Recipient: ${email} | ID: ${data.id} | Status: 200`);
    }

    // Rate limiting safeguard: 10 emails per second (Resend free tier is 2 requests/sec, Pro is higher)
    // Adjust as needed based on project scale
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  logger.info(`Batch complete! Success: ${summary.successCount}, Failures: ${summary.failureCount}`);
  return summary;
};

module.exports = { sendEmail, sendBatchEmails };
