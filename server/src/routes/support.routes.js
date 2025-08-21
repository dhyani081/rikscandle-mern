import { Router } from 'express';
import SupportTicket from '../models/SupportTicket.js';
import { sendMail } from '../config/mailer.js';

const router = Router();

router.post('/', async (req, res) => {
  const { name, email, subject, message, orderId } = req.body || {};
  if (!name || !email || !subject || !message) return res.status(400).json({ message: 'All fields required' });
  const ticket = await SupportTicket.create({ name, email, subject, message, orderId });
  // Email to admin
  try {
    if (process.env.ADMIN_EMAIL) {
      await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `Support: ${subject}`,
        text: `From: ${name} <${email}>
Order: ${orderId || '-'}

${message}`
      });
    }
  } catch (e) {
    console.warn('Support email failed:', e.message);
  }
  res.status(201).json({ ok: true, ticketId: ticket._id });
});

export default router;
