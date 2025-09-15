const sgMail = require('@sendgrid/mail');

// Only set API key if it exists
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

async function sendEmail(to, subject, text) {
  try {
    // If no API key, just log the email
    if (!process.env.SENDGRID_API_KEY) {
      console.log(`[EMAIL DISABLED] Would send email to ${to}: ${subject} - ${text}`);
      return { success: true };
    }
    
    // Convert text to HTML with proper formatting
    const htmlContent = text
      .replace(/\n/g, '<br>')
      .replace(/📍|📅|🕐|👥|🪑|📋/g, '<strong>$&</strong>')
      .replace(/TableTrek/g, '<strong>TableTrek</strong>');
    
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'tabletrek@gmail.com',
      subject,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">TableTrek</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Premium Restaurant Reservations</p>
            </div>
            <div style="color: #374151; line-height: 1.6; font-size: 16px;">
              ${htmlContent}
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This email was sent from TableTrek. If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = sendEmail;

