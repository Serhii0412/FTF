const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmail(filePath, email, subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
      attachments: [
        { filename: require("path").basename(filePath), path: filePath },
      ],
    });
    console.log("Email успешно отправлен.");
  } catch (error) {
    console.error("Ошибка отправки email:", error);
  }
}

module.exports = { sendEmail };
