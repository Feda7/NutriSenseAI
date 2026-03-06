const { db } = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


// ==========================================
// ✅ LOGIN
// ==========================================
async function findUserByCredentials(email, password) {
  const [rows] = await db.query(
    "SELECT * FROM `user` WHERE Email = ?",
    [email]
  );

  if (!rows.length) return null;

  const user = rows[0];

  const match = await bcrypt.compare(password, user.Password);
  if (!match) return null;

  return user;
}

async function login({ email, password }) {
  const user = await findUserByCredentials(email, password);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  return {
    message: "Login successful",
    user: {
      id: user.UserID,
      firstName: user.FirstName,
      email: user.Email
    }
  };
}


// ==========================================
// ✅ FORGOT PASSWORD
// ==========================================
async function forgotPassword(email) {

  const [rows] = await db.query(
    "SELECT * FROM `user` WHERE Email = ?",
    [email]
  );

  if (!rows.length) {
    throw new Error("Email not found");
  }

  const user = rows[0];

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // ساعة

  await db.query(
    `UPDATE \`user\` 
     SET resetPasswordToken = ?, 
         resetPasswordExpires = ? 
     WHERE UserID = ?`,
    [token, expires, user.UserID]
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const resetLink = `http://localhost:3000/reset-password?token=${token}`;

  await transporter.sendMail({
    to: user.Email,
    subject: "Reset Your Password - NutriSense",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 1 hour.</p>
    `
  });

  return { message: "Reset link sent successfully" };
}


// ==========================================
// ✅ RESET PASSWORD
// ==========================================
async function resetPassword({ token, newPassword }) {

  const [rows] = await db.query(
    `SELECT * FROM \`user\` 
     WHERE resetPasswordToken = ? 
     AND resetPasswordExpires > NOW()`,
    [token]
  );

  if (!rows.length) {
    throw new Error("Invalid or expired token");
  }

  const user = rows[0];

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.query(
    `UPDATE \`user\`
     SET Password = ?, 
         resetPasswordToken = NULL,
         resetPasswordExpires = NULL
     WHERE UserID = ?`,
    [hashedPassword, user.UserID]
  );

  return { message: "Password updated successfully" };
}


module.exports = {
  login,
  forgotPassword,
  resetPassword,
  findUserByCredentials
};