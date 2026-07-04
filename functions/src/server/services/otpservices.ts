import { db } from "../firebase/firebase";
import { sendOtpEmail } from "./email";

export const sendPasswordResetOtp = async (email: string) => {
  const userSnapshot = await db
    .collection("users")
    .where("email", "==", email)
    .get();

  if (userSnapshot.empty) {
    throw new Error("User not found");
  }

  const userDoc = userSnapshot.docs[0];

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  await db.collection("passwordResetOTPs").add({
    userId: userDoc.id,
    email,
    otp,
    expiresAt,
    attempts: 0,
  });

  await sendOtpEmail(email, otp);

  return true;
};