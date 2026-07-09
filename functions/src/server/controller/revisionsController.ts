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
    const { subject, topics, date } = req.body;

    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    if (!subject || !Array.isArray(topics) || topics.length === 0 || !date) {
      return fail(res, "Subject, topics and date are required");
    }

    const userRef = db.collection("users").doc(userId);
    const snap = await userRef.get();

    if (!snap.exists) {
      return fail(res, "User not found", 404);
    }

    const user = snap.data();
    const revisions = user?.revisions || [];

    const index = revisions.findIndex(
      (r: any) =>
        r.subject.toLowerCase() === subject.toLowerCase()
    );

    if (index >= 0) {
      const existingTopics = revisions[index].topics || [];

      topics.forEach((topic: any) => {
        const topicName =
          typeof topic === "string" ? topic : topic.name;

        const exists = existingTopics.some(
          (t: any) => t.name === topicName
        );

        if (!exists) {
          existingTopics.push({
            name: topicName,
            progress: 0,
          });
        }
      });

      revisions[index].topics = existingTopics;
      revisions[index].date = date;
    } else {
      revisions.push({
        subject,
        date,
        createdAt: Date.now(),
        topics: topics.map((t: any) => ({
          name: typeof t === "string" ? t : t.name,
          progress: 0,
        })),
      });
    }

    await userRef.update({
      revisions,
      updatedAt: Date.now(),
    });

    return ok(res, "Revision saved", { revisions });
  } catch (error) {
    console.error(error);
    return fail(res, "Internal server error", 500);
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

export const updateRevisionProgressController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const { subject, topic, progress } = req.body;

    if (!userId) return fail(res, "Unauthorized", 401);

    const userRef = db.collection("users").doc(userId);
    const snap = await userRef.get();

    if (!snap.exists) return fail(res, "User not found", 404);

    const user = snap.data();
    const revisions = user?.revisions || [];

    revisions.forEach((revision: any) => {
      if (revision.subject !== subject) return;

      revision.topics = revision.topics.map((t: any) =>
        t.name === topic
          ? {
              ...t,
              progress,
            }
          : t
      );
    });

    await userRef.update({
      revisions,
      updatedAt: Date.now(),
    });

    return ok(res, "Progress updated", { revisions });
  } catch (error) {
    console.error(error);
    return fail(res, "Internal server error", 500);
  }
};
export const deleteRevisionController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const { subject, topic } = req.body;

    if (!userId) return fail(res, "Unauthorized", 401);

    const userRef = db.collection("users").doc(userId);
    const snap = await userRef.get();

    if (!snap.exists) return fail(res, "User not found", 404);

    const user = snap.data();
    const revisions = user?.revisions || [];

    revisions.forEach((revision: any) => {
      if (revision.subject !== subject) return;

      revision.topics = revision.topics.filter(
        (t: any) => t.name !== topic
      );
    });

    await userRef.update({
      revisions,
      updatedAt: Date.now(),
    });

    return ok(res, "Deleted", { revisions });
  } catch (error) {
    console.error(error);
    return fail(res, "Internal server error", 500);
  }
};