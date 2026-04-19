// SMS Backend Server - Node.js with Express and Twilio
// Deploy this on Replit, Railway, or Heroku for FREE

const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Twilio Configuration - Get these from https://console.twilio.com
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Initialize Twilio client (only if credentials are set)
let twilioClient;
if (TWILIO_ACCOUNT_SID !== 'your_account_sid') {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'SMS Backend is running!' });
});

// Send SMS Endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, message } = req.body;

    // Validate input
    if (!to || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing "to" or "message" field' 
      });
    }

    // Check if Twilio is configured
    if (!twilioClient) {
      return res.status(500).json({ 
        success: false, 
        error: 'Twilio not configured. Set environment variables.' 
      });
    }

    // Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log(`SMS sent! SID: ${result.sid}`);
    
    res.json({ 
      success: true, 
      message: 'SMS sent successfully!',
      sid: result.sid 
    });

  } catch (error) {
    console.error('SMS Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SMS Backend running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET  /health - Check if server is running');
  console.log('  POST /api/send-sms - Send SMS message');
});
