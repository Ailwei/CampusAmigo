import { Request, Response } from "express";
import { db } from "../firebase/firebase";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/secrets";
import { sendPasswordResetOtp } from "../services/otpservices";
import { verifyToken } from "../services/googleAuthService";
import { AuthRequest } from "../midlwWare/middleWare";
import { capitalize } from "../utils/formatter";

const ok = (res: Response, message: string, data?: any, status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });


export const createUserController = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return fail(res, "All fields are required: firstName, lastName, email, password", 400);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return fail(
        res,
        "Password must be at least 8 characters and include uppercase, lowercase, and a number",
        400
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return fail(res, "Please enter a valid email address", 400);
    }
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", normalizedEmail)
      .get();

    if (!usersSnapshot.empty) {
      return fail(res, "An account with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const docRef = await db.collection("users").add({
      firstName: capitalize(firstName),
      lastName: capitalize(lastName),
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: Date.now(),
    });

    return ok(res, "Account created successfully", {
      userId: docRef.id,
    }, 201);
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};

export const googleLoginController = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Missing token" });
    }

    const profile = await verifyToken(idToken);

    if (!profile) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userRef = db.collection("users").doc(profile.sub);

    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : null;

    if (!userSnap.exists) {
      await userRef.set({
        email: profile.email,
        firstName: capitalize(profile.name),
        picture: profile.picture,
        provider: "google",
        createdAt: Date.now(),

        onboardingCompleted: false,
        currencyDefault: null,
      });
    }

    const token = jwt.sign(
      {
        userId: profile.sub,
        email: profile.email,
        firstName: capitalize(profile.given_name),
        lastName: capitalize(profile.family_name ?? ""),
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: profile.sub,
        email: profile.email,
        firstName: capitalize(profile.given_name || ""),
        lastName: capitalize(profile.family_name || ""),
        name: capitalize(profile.name),
        onboardingCompleted: userData?.onboardingCompleted ?? false,
        currencyDefault: userData?.currencyDefault ?? null,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(500).json({ message: "Google login failed" });
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return fail(res, "Email and password are required", 400);
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return fail(res, "Please enter a valid email address", 400);
    }

    const userSnapshot = await db
      .collection("users")
      .where("email", "==", normalizedEmail)
      .get();

    if (userSnapshot.empty) {
      return fail(res, "No account found with this email", 404);
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return fail(res, "Incorrect password", 401);
    }

    const JWT_SECRET = getJwtSecret();

    const token = jwt.sign(
      {
        userId: userDoc.id,
        email: userData.email,
        username: userData.username || null,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return ok(res, "Login successful", {
      token,
      user: {
        id: userDoc.id,
        email: userData.email,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        onboardingCompleted: userData.onboardingCompleted ?? false,
        currencyDefault: userData.currencyDefault ?? null,
      }
    });
  } catch (error) {
    return fail(res, "Internal server error", 500);
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return fail(res, "Email is required", 400);
  }

  try {
    await sendPasswordResetOtp(email.toLowerCase().trim());

    return ok(res, "If an account exists, a verification code has been sent");
  } catch (error) {
    console.error(error);
    return ok(res, "If an account exists, a verification code has been sent");
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return fail(res, "Email, OTP, and new password are required", 400);
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const snapshot = await db
      .collection("passwordResetOTPs")
      .where("email", "==", normalizedEmail)
      .get();

    if (snapshot.empty) {
      return fail(res, "Invalid or expired request", 400);
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    if (data.expiresAt < Date.now()) {
      await doc.ref.delete();
      return fail(res, "OTP expired. Please request a new one", 400);
    }

    if (data.otp !== otp) {
      await doc.ref.update({
        attempts: (data.attempts || 0) + 1,
      });

      return fail(res, "Invalid verification code", 400);
    }

    const userSnapshot = await db
      .collection("users")
      .where("email", "==", normalizedEmail)
      .get();

    if (userSnapshot.empty) {
      return fail(res, "User not found", 404);
    }

    const userDoc = userSnapshot.docs[0];

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("users").doc(userDoc.id).update({
      password: hashedPassword,
    });

    await doc.ref.delete();

    return ok(res, "Password has been reset successfully");
  } catch (error) {
    return fail(res, "Internal server error", 500);
  }
};
export const getMeController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return fail(res, "Unauthorized", 401);

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return fail(res, "User not found", 404);

    const user = userDoc.data();

    const [classesSnap, timetableSnap] = await Promise.all([
      db.collection("users").doc(userId).collection("classes").get(),
      db.collection("users").doc(userId).collection("timetable").get(),
    ]);

    const classes = classesSnap.docs.map(d => d.data());
    const timetable = timetableSnap.docs.map(d => d.data());

    return ok(res, "User fetched", {
      id: userDoc.id,
      ...user,
      classes,
      timetable,
    });

  } catch (e) {
    return fail(res, "Internal server error", 500);
  }
};

export const updateProfileController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    const { name, currency } = req.body;

    const updates: any = {};
    if (name) updates.name = name;
    if (currency) updates.currencyDefault = currency;

    await db.collection("users").doc(userId).update(updates);

    const updatedDoc = await db.collection("users").doc(userId).get();

    return ok(res, "Profile updated", {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (e) {
    console.error(e);
    return fail(res, "Internal server error", 500);
  }
};
export const deleteAccountController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return fail(res, "User not found", 404);
    }

    await userRef.delete();

    return ok(res, "Account deleted successfully", {
      id: userId,
    });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    return fail(res, "Internal server error", 500);
  }
};