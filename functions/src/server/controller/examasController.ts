import { Response } from "express";
import { db } from "../firebase/firebase";
import { AuthRequest } from "../midlwWare/middleWare";
import { formatRetrievedEntry } from "../utils/formatter";

const ok = (res: Response, message: string, data?: any, status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const addExamController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { subjectId, date, venue, progress } = req.body;

    if (!userId) return fail(res, "Unauthorized", 401);

    if (!subjectId) {
      return fail(res, "Missing required  fields", 400);
    }


    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return fail(res, "User not found", 404);
    }

    const userData = userSnap.data();
    const exams = userData?.exams || [];

    const isDuplicate = exams.some(
      (e: any) => e.subjectId === subjectId
    );

    if (isDuplicate) {
      return fail(
        res,
        "An exam for this subject already exists",
        409
      );
    }

    const now = Date.now();

    const exam = {
      id: `exam_${now}`,
      subjectId,
      date,
      venue: venue ?? "",
      progress: progress ?? 0,
      createdAt: now,
    };

    const updatedExams = [...exams, exam];

    await userRef.update({
      exams: updatedExams,
      updatedAt: now,
    });

    return ok(res, "Exam added successfully", {
      exams: updatedExams,
    });

  } catch (error) {
    console.error("ADD EXAM ERROR:", error);
    return fail(res, "Internal server error", 500);
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
    const subjects = userData?.subjects || [];

    const subjectMap = new Map(subjects.map((s: any) => [s.id, s]));

    const sorted = exams
      .map((e: any) => ({
        ...e,
        subject: subjectMap.get(e.subjectId) || null,
      }))
      .sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .map(formatRetrievedEntry);

    return ok(res, "Exams fetched", { exams: sorted });
  } catch (error) {
    console.error("GET EXAMS ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};


export const updateExamProgressController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { examId, progress } = req.body;
    if (!userId) return fail(res, "Unauthorized", 401);
    if (!examId || progress == null) {
      return fail(res, "Exam code and progress are required", 400);
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const exams = userData?.exams || [];

    const updatedExams = exams.map((e: any) =>
      e.id === examId
        ? { ...e, progress }
        : e
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
    const { examId } = req.body;
    if (!userId) return fail(res, "Unauthorized", 401);
    if (!examId) return fail(res, "Exam code is required", 400);

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const exams = userData?.exams || [];

    const updatedExams = exams.filter(
      (e: any) => e.id !== examId
    );
    await userRef.update({ exams: updatedExams, updatedAt: Date.now() });

    return ok(res, "Exam deleted successfully", { exams: updatedExams });
  } catch (error) {
    console.error("DELETE EXAM ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};

