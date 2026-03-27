const express = require('express');
const router = express.Router();

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
router.post('/send', async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = generateOTP();
    
    otpStore.set(phone, {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    });

    // For development: log OTP
    console.log(`📱 OTP for ${phone}: ${otp}`);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const stored = otpStore.get(phone);
    
    if (!stored) {
      return res.status(400).json({ verified: false, error: 'OTP expired or not requested' });
    }
    
    if (stored.expires < Date.now()) {
      otpStore.delete(phone);
      return res.status(400).json({ verified: false, error: 'OTP expired' });
    }
    
    if (stored.otp !== otp) {
      return res.status(400).json({ verified: false, error: 'Invalid OTP' });
    }
    
    otpStore.delete(phone);
    res.json({ verified: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
