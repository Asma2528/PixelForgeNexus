const nodemailer = require('nodemailer');

// Function to send an email
const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Using Gmail's SMTP service
      auth: {
        user: process.env.EMAIL_USER,  // Your email (read from environment variable)
        pass: process.env.EMAIL_PASS,  // Your email password or an app-specific password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,  // Sender's email address
      to,  // Recipient email address
      subject,  // Subject of the email
      text,  // Plain text content of the email
      html,  // HTML content of the email (optional)
    };

    await transporter.sendMail(mailOptions);  // Send the email
    console.log(`Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.error('Error sending email:', error);  // Log any errors
    throw new Error('Email sending failed');
  }
};

// Helper function to send OTP email
const sendOtpEmail = async (to, otpCode) => {
  const subject = 'Your OTP for MFA';
  const text = `Your One-Time Password (OTP) is: ${otpCode}`;
  const html = `<p>Your One-Time Password (OTP) is: <strong>${otpCode}</strong></p>`;
  
  await sendEmail(to, subject, text, html);  // Reuse sendEmail function
};

// Helper function to send password reset email
const sendPasswordResetEmail = async (to, resetLink) => {
  const subject = 'Password Reset Request';
  const text = `Click here to reset your password: ${resetLink}`;
  const html = `<p>Click here to reset your password: <a href="${resetLink}">${resetLink}</a></p>`;
  
  await sendEmail(to, subject, text, html);  // Reuse sendEmail function
};

module.exports = {
  sendOtpEmail,
  sendPasswordResetEmail,
};
