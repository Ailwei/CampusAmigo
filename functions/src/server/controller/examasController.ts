import { Response } from "express";
import { db } from "../firebase/firebase";
import { AuthRequest } from "../midlwWare/middleWare";

const ok = (res: Response, message: string, data?: any, status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const addExamController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { subject, code, date, venue, progress } = req.body;
    console.log(req.body)

    if (!userId) return fail(res, "Unauthorized", 401);
    if (!subject) {
      return fail(res, "Subject is required", 400);
    }

    const exam = {
      subject,
      code: code ?? "",
      date: date,
      venue: venue ?? "",
      progress: progress ?? 0,
      createdAt: Date.now(),
    };

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const exams = userData?.exams || [];

    const updatedExams = [...exams, exam];
    await userRef.update({ exams: updatedExams, updatedAt: Date.now() });

    return ok(res, "Exam added successfully", { exams: updatedExams });
  } catch (error) {
    console.error("ADD EXAM ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};

export const getExamsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return fail(res, "Unauthorized", 401);

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const exams = userData?.exams || [];

    const sorted = exams.sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return ok(res, "Exams fetched", { exams: sorted });
  } catch (error) {
    console.error("GET EXAMS ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};

export const updateExamProgressController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { code, progress } = req.body;

    if (!userId) return fail(res, "Unauthorized", 401);
    if (!code || progress == null) {
      return fail(res, "Exam code and progress are required", 400);
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const exams = userData?.exams || [];

    const updatedExams = exams.map((e: any) =>
      e.code === code ? { ...e, progress } : e
    );

    await userRef.update({ exams: updatedExams, updatedAt: Date.now() });

    return ok(res, "Exam progress updated", { exams: updatedExams });
  } catch (error) {
    console.error("UPDATE EXAM ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};
export const deleteExamController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { code } = req.body;

    if (!userId) return fail(res, "Unauthorized", 401);
    if (!code) return fail(res, "Exam code is required", 400);

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const exams = userData?.exams || [];

    const updatedExams = exams.filter((e: any) => e.code !== code);

    await userRef.update({ exams: updatedExams, updatedAt: Date.now() });

    return ok(res, "Exam deleted successfully", { exams: updatedExams });
  } catch (error) {
    console.error("DELETE EXAM ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};

