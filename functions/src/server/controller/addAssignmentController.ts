import { Response } from "express";
import { db } from "../firebase/firebase";
import { AuthRequest } from "../midlwWare/middleWare";

const ok = (res: Response, message: string, data?: any, status = 200) =>
  res.status(status).json({
    success: true,
    message,
    data,
  });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({
    success: false,
    message,
  });

export const addAssignmentTaskController = async (
  req: AuthRequest,
  res: Response
) => {
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
    const assignmentTasks = user?.assignmentTasks || [];

    const index = assignmentTasks.findIndex(
      (task: any) =>
        task.subject.toLowerCase() === subject.toLowerCase()
    );

    if (index >= 0) {
      const existingTopics = assignmentTasks[index].topics || [];

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

      assignmentTasks[index].topics = existingTopics;
      assignmentTasks[index].date = date;
    } else {
      assignmentTasks.push({
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
      assignmentTasks,
      updatedAt: Date.now(),
    });

    return ok(res, "Assignment task saved", {
      assignmentTasks,
    });
  } catch (error) {
    console.error(error);
    return fail(res, "Internal server error", 500);
  }
};

export const getAssignmentTasksController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    const userRef = db.collection("users").doc(userId);
    const snap = await userRef.get();

    if (!snap.exists) {
      return fail(res, "User not found", 404);
    }

    const user = snap.data();

    const assignmentTasks = user?.assignmentTasks || [];

    const sorted = assignmentTasks.sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return ok(res, "Assignment tasks fetched", {
      assignmentTasks: sorted,
    });
  } catch (error) {
    console.error(error);
    return fail(res, "Internal server error", 500);
  }
};

export const updateAssignmentTaskProgressController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const { subject, topic, progress } = req.body;

    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    const userRef = db.collection("users").doc(userId);
    const snap = await userRef.get();

    if (!snap.exists) {
      return fail(res, "User not found", 404);
    }

    const user = snap.data();
    const assignmentTasks = user?.assignmentTasks || [];

    assignmentTasks.forEach((task: any) => {
      if (task.subject !== subject) return;

      task.topics = task.topics.map((t: any) =>
        t.name === topic
          ? {
              ...t,
              progress,
            }
          : t
      );
    });

    await userRef.update({
      assignmentTasks,
      updatedAt: Date.now(),
    });

    return ok(res, "Progress updated", {
      assignmentTasks,
    });
  } catch (error) {
    console.error(error);
    return fail(res, "Internal server error", 500);
  }
};

export const deleteAssignmentTaskController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const { subject, topic } = req.body;

    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    const userRef = db.collection("users").doc(userId);
    const snap = await userRef.get();

    if (!snap.exists) {
      return fail(res, "User not found", 404);
    }

    const user = snap.data();
    const assignmentTasks = user?.assignmentTasks || [];

    assignmentTasks.forEach((task: any) => {
      if (task.subject !== subject) return;

      task.topics = task.topics.filter(
        (t: any) => t.name !== topic
      );
    });

    await userRef.update({
      assignmentTasks,
      updatedAt: Date.now(),
    });

    return ok(res, "Deleted", {
      assignmentTasks,
    });
  } catch (error) {
    console.error(error);
    return fail(res, "Internal server error", 500);
  }
};