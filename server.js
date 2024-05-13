const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.json());

const accountSid = '';
const authToken = '';
const client = twilio(accountSid, authToken);

app.post('/send-sms', async (req, res) => {
  const { to, body } = req.body;

  try {
    const message = await client.messages.create({
      body,
      to,
      from: '', // Your Twilio phone number
    });
    console.log(message); // Log Twilio API response
    res.json({ success: true, message: 'SMS sent successfully' });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, message: 'Failed to send SMS' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
