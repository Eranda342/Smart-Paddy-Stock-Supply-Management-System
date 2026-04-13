const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Missing EMAIL_USER or EMAIL_PASS in .env file.");
    return false; // Non-blocking failure
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `${process.env.FROM_NAME || "AgroBridge"} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
    return true; // Success
  } catch (err) {
    console.error("Error sending email:", err.message);
    return false; // Non-blocking failure
  }
};

module.exports = sendEmail;
