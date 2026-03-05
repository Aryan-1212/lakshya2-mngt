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
 * @param {string|string[]} opts.to - Recipient(s) for the 'To' field
 * @param {string|string[]} [opts.bcc] - Recipient(s) for the 'Bcc' field (privacy)
 * @param {string} opts.subject - Email subject
 * @param {string} opts.html - HTML content
 * @param {string} [opts.text] - Plain text fallback
 * @returns {Promise<Object|null>}
 */
const sendEmail = async ({ to, bcc, subject, html, text }) => {
  const client = getClient();
  if (!client) return null;

  const from = process.env.EMAIL_FROM;
  if (!from) {
    logger.warn('EMAIL_FROM not set — email not sent.');
    return null;
  }

  // Auto-generate plain text fallback by stripping HTML tags if not provided
  const textFallback = text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  try {
    const payload = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: textFallback,
    };

    if (bcc) {
      payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
    }

    const { data, error } = await client.emails.send(payload);

    if (error) {
      logger.error(`Resend error: ${JSON.stringify(error)}`);
      return null;
    }

    const recipientsCount = (payload.to?.length || 0) + (payload.bcc?.length || 0);
    logger.info(`Email sent [${data.id}] to ${recipientsCount} recipients`);
    return data;
  } catch (err) {
    logger.error(`sendEmail threw: ${err.message}`);
    return null;
  }
};

/**
 * Send emails to a large list in batches using BCC for privacy.
 * @param {string[]} emails
 * @param {string} subject
 * @param {string} html
 * @param {number} [batchSize=50] - Resend allows up to 50 recipients in a single call (total of to+cc+bcc)
 */
const sendBatchEmails = async (emails, subject, html, batchSize = 49) => {
  if (!emails.length) return;
  
  const from = process.env.EMAIL_FROM;
  if (!from) {
    logger.warn('EMAIL_FROM not set — batch email aborted.');
    return;
  }

  let sent = 0;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    
    // Use the sender email as 'to' and the batch as 'bcc' for privacy
    const result = await sendEmail({ 
      to: from, 
      bcc: batch, 
      subject, 
      html 
    });
    
    if (result) sent += batch.length;
    
    // Small delay between batches to stay within rate limits (Resend is generous but good practice)
    if (i + batchSize < emails.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  logger.info(`Batch email complete: ${sent}/${emails.length} delivered`);
};

module.exports = { sendEmail, sendBatchEmails };
