import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL, // e.g., 'noreply@yourdomain.com'
      subject,
      text,
    });
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('SendGrid error:', error);
    return res.status(500).json({ message: `Failed to send email: ${error.message}` });
  }
}