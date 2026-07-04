import nodemailer from "nodemailer";
import { ENV } from "../config/env";

export const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    
    host: ENV.SMTP_HOST,
    port: Number(ENV.SMTP_PORT),
    secure: false,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
    
  });

  await transporter.sendMail({
    from: `"The Groove App" <${ENV.SMTP_FROM}>`,
    to: email,
    subject: "Your OTP to Reset Password",
    html: `<h2>${otp}</h2>`,
  });
};