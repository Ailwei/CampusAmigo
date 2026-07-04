import { Response } from "express";
import { db } from "../firebase/firebase";
import { AuthRequest } from "../midlwWare/middleWare";

const ok = (res: Response, message: string, data?: any, status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const addRevisionController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { subject, topic, date, progress } = req.body;

    if (!userId) return fail(res, "Unauthorized", 401);
    if (!subject || !topic || !date) {
      return fail(res, "Subject, topic, and date are required", 400);
    }

    const revision = {
      subject,
      topic,
      date,
      progress: progress ?? 0,
      createdAt: Date.now(),
    };

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const revisions = userData?.revisions || [];

    const updatedRevisions = [...revisions, revision];
    await userRef.update({ revisions: updatedRevisions, updatedAt: Date.now() });

    return ok(res, "Revision added successfully", { revisions: updatedRevisions });
  } catch (error) {
    console.error("ADD REVISION ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};

export const getRevisionsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return fail(res, "Unauthorized", 401);

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const revisions = userData?.revisions || [];

    const sorted = revisions.sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return ok(res, "Revisions fetched", { revisions: sorted });
  } catch (error) {
    console.error("GET REVISIONS ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};

export const updateRevisionProgressController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { topic, progress } = req.body;

    if (!userId) return fail(res, "Unauthorized", 401);
    if (!topic || progress == null) {
      return fail(res, "Topic and progress are required", 400);
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const revisions = userData?.revisions || [];

    const updatedRevisions = revisions.map((r: any) =>
      r.topic === topic ? { ...r, progress } : r
    );

    await userRef.update({ revisions: updatedRevisions, updatedAt: Date.now() });

    return ok(res, "Revision progress updated", { revisions: updatedRevisions });
  } catch (error) {
    console.error("UPDATE REVISION ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};
export const deleteRevisionController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { topic } = req.body; // or use an ID if you generate one

    if (!userId) return fail(res, "Unauthorized", 401);
    if (!topic) return fail(res, "Revision topic is required", 400);

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const revisions = userData?.revisions || [];

    const updatedRevisions = revisions.filter((r: any) => r.topic !== topic);

    await userRef.update({ revisions: updatedRevisions, updatedAt: Date.now() });

    return ok(res, "Revision deleted successfully", { revisions: updatedRevisions });
  } catch (error) {
    console.error("DELETE REVISION ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};
