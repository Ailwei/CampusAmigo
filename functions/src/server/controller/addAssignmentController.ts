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
    const { assignmentId, topics } = req.body;

    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    if (
      !assignmentId ||
      !Array.isArray(topics) ||
      topics.length === 0
    ) {
      return fail(res, "Assignment id and topics are required");
    }

    const userRef = db.collection("users").doc(userId);
    const snap = await userRef.get();

    if (!snap.exists) {
      return fail(res, "User not found", 404);
    }

    const user = snap.data();
    const assignments = user?.assignments || [];

    const updatedAssignments = assignments.map((assignment: any) => {

      if (assignment.id !== assignmentId) {
        return assignment;
      }

      const now = Date.now();

      const task = {
        id: `task_${now}`,
        topics,
        progress: 0,
        createdAt: now,
      };

      return {
        ...assignment,
        tasks: [
          ...(assignment.tasks || []),
          task
        ]
      };
    });


    await userRef.update({
      assignments: updatedAssignments,
      updatedAt: Date.now(),
    });


    return ok(res, "Task added", {
      assignments: updatedAssignments
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

    const assignments = user?.assignments || [];

    const assignmentTasks = assignments.flatMap((assignment: any) =>
      (assignment.tasks || []).map((task: any) => ({
        ...task,
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        subject: assignment.subject,
        date: assignment.due,

      }))
    );
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
    const { assignmentId, topic, progress } = req.body;

    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    if (!assignmentId || !topic || progress === undefined) {
      return fail(res, "assignmentId, topic and progress are required");
    }

    const userRef = db.collection("users").doc(userId);
    const snap = await userRef.get();

    if (!snap.exists) {
      return fail(res, "User not found", 404);
    }

    const user = snap.data();
    const assignments = user?.assignments || [];

    let matched = false;

    const updatedAssignments = assignments.map((assignment: any) => {
      if (assignment.id !== assignmentId) {
        return assignment;
      }

      const updatedTasks = (assignment.tasks || []).map((task: any) => {
        const hasTopic = (task.topics || []).some((t: any) => t.name === topic);
        if (!hasTopic) return task;

        matched = true;

        return {
          ...task,
          topics: task.topics.map((t: any) =>
            t.name === topic ? { ...t, progress } : t
          ),
        };
      });

      return { ...assignment, tasks: updatedTasks };
    });

    if (!matched) {
      return fail(res, "Task or topic not found", 404);
    }

    await userRef.update({
      assignments: updatedAssignments,
      updatedAt: Date.now(),
    });

    const assignmentTasks = updatedAssignments.flatMap((assignment: any) =>
      (assignment.tasks || []).map((task: any) => ({
        ...task,
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        subject: assignment.subject,
        date: assignment.due,
      }))
    );

    return ok(res, "Progress updated", { assignmentTasks });
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