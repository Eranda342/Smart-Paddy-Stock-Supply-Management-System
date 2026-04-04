const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Missing EMAIL_USER or EMAIL_PASS in .env file.");
    throw new Error("Server email configuration is missing. Please add EMAIL_USER and EMAIL_PASS to your .env file.");
  }

  // Create transporter properly using Gmail service and ENV vars
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Construct mail options
  const mailOptions = {
    from: `${process.env.FROM_NAME || "AgroBridge"} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Add html conditionally if provided
  if (options.html) {
    mailOptions.html = options.html;
  }

  try {
    // Send email using transporter
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    return info;
  } catch (err) {
    // Log the actual error for debugging and throw it to controller
    console.error("Error sending email:", err);
    throw new Error("Email could not be sent: " + err.message);
  }
};

module.exports = sendEmail;
