const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(to, message) {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`[SMS Disabled] Would send SMS to ${to}: ${message}`);
      return { success: true };
    }
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890', // You'll need to set this
      to: to
    });
    
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS Error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = sendSMS;
