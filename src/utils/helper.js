import nodemailer from "nodemailer";

export class ErrorMessage extends Error {
  constructor(msg, statusCode) {
    super(msg);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export function catchErrorAsync(asyncFn) {
  return (req, res, next) => {
    asyncFn(req, res, next).catch((error) => {
      next(error);
    });
  };
}

export async function sendEmail(options) {
  let transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: "admin@gmail.com",
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
