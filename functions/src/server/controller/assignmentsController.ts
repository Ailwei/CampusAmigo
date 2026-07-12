import { Response } from "express";
import { db } from "../firebase/firebase";
import { AuthRequest } from "../midlwWare/middleWare";
import { formatRetrievedEntry } from "../utils/formatter";

const ok = (res: Response, message: string, data?: any, status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const addAssignmentController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { title, subject, due, progress } = req.body;

    if (!userId) return fail(res, "Unauthorized", 401);
    if (!title || !subject || !due) {
      return fail(res, "Title, subject, and due date are required", 400);
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const assignments = userData?.assignments || [];
    
    const normalize = (val: any) =>
      typeof val === "string" ? val.trim().toLowerCase() : "";

    const normalizedSubject = normalize(subject);

    console.log("Incoming:", {
  title,
  subject,
});

  const isDuplicate = assignments.some((a: any) => {
  const existingSubject =
    typeof a.subject === "string"
      ? a.subject
      : a.subject?.name;

  return normalize(existingSubject) === normalizedSubject;
});

    if (isDuplicate) {
      return fail(
        res,
        `An assignment called "${subject}" already exists !`,
        409
      );
    }

    const assignment = {
      title,
      subject,
      due,
      progress: progress ?? 0,
      createdAt: Date.now(),
    };

    const updatedAssignments = [...assignments, assignment];
    await userRef.update({ assignments: updatedAssignments, updatedAt: Date.now() });

    return ok(res, "Assignment added successfully", { assignments: updatedAssignments });
  } catch (error) {
    console.error("ADD ASSIGNMENT ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};

export const getAssignmentsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return fail(res, "Unauthorized", 401);

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const assignments = userData?.assignments || [];

    const sorted = assignments.sort(
      (a: any, b: any) => new Date(a.due).getTime() - new Date(b.due).getTime()
    ).map(formatRetrievedEntry);

    return ok(res, "Assignments fetched", { assignments: sorted });
  } catch (error) {
    console.error("GET ASSIGNMENTS ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};

export const updateAssignmentProgressController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { title, progress } = req.body;

    if (!userId) return fail(res, "Unauthorized", 401);
    if (!title || progress == null) {
      return fail(res, "Title and progress are required", 400);
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const assignments = userData?.assignments || [];

    const updatedAssignments = assignments.map((a: any) =>
      a.title === title ? { ...a, progress } : a
    );

    await userRef.update({ assignments: updatedAssignments, updatedAt: Date.now() });

    return ok(res, "Assignment progress updated", { assignments: updatedAssignments });
  } catch (error) {
    console.error("UPDATE ASSIGNMENT ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};
export const deleteAssignmentController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { title } = req.body;

    if (!userId) return fail(res, "Unauthorized", 401);
    if (!title) return fail(res, "Assignment title is required", 400);

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const assignments = userData?.assignments || [];

    const updatedAssignments = assignments.filter((a: any) => a.title !== title);

    await userRef.update({ assignments: updatedAssignments, updatedAt: Date.now() });

    return ok(res, "Assignment deleted successfully", { assignments: updatedAssignments });
  } catch (error) {
    console.error("DELETE ASSIGNMENT ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};