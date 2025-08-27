const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const path = require('path');
const app = express();
require('dotenv').config(); // Load environment variables

// Define a port, defaulting to 3000 if not set
const PORT = process.env.PORT || 3000;

// Serve frontend to pick up the athylete_source html named as index.html for easy deployment
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.json()); // To parse JSON bodies from incoming requests
app.use(cors()); // Enable CORS for all routes, allowing your frontend to make requests

// Create a transporter object using your email service details
const transporter = nodemailer.createTransport({
    service: 'gmail', // or 'outlook', 'yahoo', etc.
    auth: {
        user: process.env.EMAIL_USER, // Your sending email address (e.g., iamathylete@gmail.com)
        pass: process.env.EMAIL_PASS  // Your email password or app-specific password
    }
});

// --- Existing Endpoint for Consultation Form ---
app.post('/api/book-consultation', (req, res) => {
    const { fullName, emailAddress, interestedService } = req.body;

    if (!fullName || !emailAddress || !interestedService) {
        return res.status(400).json({ message: 'Missing required consultation fields.' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: 'drsudeepsatpathy@gmail.com,jaydeep1984@gmail.com', // Recipient for consultations
        subject: `New Athylete Consultation Request from ${fullName}`,
        html: `
            <p>You have a new consultation request:</p>
            <ul>
                <li><strong>Name:</strong> ${fullName}</li>
                <li><strong>Email:</strong> ${emailAddress}</li>
                <li><strong>Interested Service:</strong> ${interestedService}</li>
            </ul>
            <p>Please contact them to schedule the consultation.</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending consultation email:', error);
            return res.status(500).json({ message: 'Failed to send consultation request.', error: error.message });
        }
        console.log('Consultation email sent successfully:', info.response);
        res.status(200).json({ message: 'Consultation request sent successfully!' });
    });
});

// --- NEW Endpoint for Contact Form ---
app.post('/api/send-contact-message', (req, res) => {
    const { fullName, emailAddress, interestedService, message } = req.body;

    // Validate the incoming data
    if (!fullName || !emailAddress || !message) {
        return res.status(400).json({ message: 'Missing required contact form fields (Name, Email, Message).' });
    }

    // Set up the email options
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: 'drsudeepsatpathy@gmail.com,jaydeep1984@gmail.com', // Recipient for general contact messages
        subject: `New Contact Message from ${fullName} (Athylete Website)`,
        html: `
            <p>You have received a new message from your Athylete website contact form:</p>
            <ul>
                <li><strong>Name:</strong> ${fullName}</li>
                <li><strong>Email:</strong> ${emailAddress}</li>
                <li><strong>Interested Service:</strong> ${interestedService || 'Not specified'}</li>
                <li><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</li>
            </ul>
            <p>Please respond to them at your earliest convenience.</p>
        `
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending contact message email:', error);
            return res.status(500).json({ message: 'Failed to send contact message.', error: error.message });
        }
        console.log('Contact message email sent successfully:', info.response);
        res.status(200).json({ message: 'Contact message sent successfully!' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
