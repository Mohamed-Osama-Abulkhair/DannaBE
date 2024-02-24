import nodemailer from "nodemailer";
import { htmlOfEmail } from "./verify.email.html.js";
import jwt from "jsonwebtoken";

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.Email,
      pass: process.env.Pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let token = "";
  if (options.verifyType == "signUpVerify") {
    token = jwt.sign({ email: options.email }, process.env.JWT_secretKey);
  }

  const info = await transporter.sendMail({
    from: `"Danna App" <${process.env.Email}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    html: htmlOfEmail(
      token,
      options.verifyType,
      options.title,
      options.text,
      options.btnMessage
    ),
  });
};
