import { Response } from "express";
import { db } from "../firebase/firebase";
import { AuthRequest } from "../midlwWare/middleWare";
import { formatRetrievedEntry } from "../utils/formatter";

const ok = (res: Response, message: string, data?: any, status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const saveSubjectController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const { classes } = req.body;

    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    if (!Array.isArray(classes) || classes.length === 0) {
      return fail(res, "Please add at least one subject", 400);
    }

    const invalidSubject = classes.find(
      (subject: any) => !subject.name?.trim()
    );

    if (invalidSubject) {
      return fail(res, "Every subject must have a name", 400);
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return fail(res, "User not found", 404);
    }

    const formattedSubjects = classes.map((subject: any) => ({
      id: subject.id || Date.now().toString() + Math.random(),
      name: subject.name.trim(),
      code: subject.code?.trim() || "",
      room: subject.room?.trim() || "",
    }));
const existingSubjects = userSnap.data()?.subjects || [];

await userRef.update({
  subjects: [...existingSubjects, ...formattedSubjects],
  updatedAt: Date.now(),
});

    return ok(res, "Subjects saved successfully", {
      subjects: formattedSubjects,
    });
  } catch (error) {
    console.error("SAVE SUBJECT ERROR:", error);

    return fail(
      res,
      (error as any)?.message || "Internal server error",
      500
    );
  }
};

export const getSubjectsController = async (req: AuthRequest, res: Response) => {
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
 
    const userData = userSnap.data();
 
    return ok(res, "Subjects fetched", {
      subjects: userData?.subjects || [],
    });
  } catch (error) {
    console.error("GET SUBJECTS ERROR:", error);
 
    return fail(
      res,
      (error as any)?.message || "Internal server error",
      500
    );
  }
};
 

export const saveClassController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const { subjectId, day, startTime, endTime } = req.body;

    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    if (!subjectId || !day || !startTime || !endTime) {
      return fail(res, "Missing required fields", 400);
    }

    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);

    if (newEnd <= newStart) {
      return fail(res, "End time must be after start time", 400);
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return fail(res, "User not found", 404);
    }

    const userData = userSnap.data();
    const timetable = userData?.timetable || [];

    const clash = timetable.some((slot: any) => {
      if (slot.day !== day) return false;

      const slotStart = toMinutes(slot.startTime);
      const slotEnd = toMinutes(slot.endTime);

      return newStart < slotEnd && newEnd > slotStart;
    });

    if (clash) {
      return fail(res, "Time clash detected", 409);
    }

    const newClass = {
  id: Date.now().toString(),
  subjectId,
  day,
  startTime,
  endTime,
};

const updatedTimetable = [...timetable, newClass];

await userRef.update({
  timetable: updatedTimetable,
  updatedAt: Date.now(),
});

const subjects = userData?.subjects || [];

const timetableWithSubjects = updatedTimetable.map((slot: any) => ({
  ...slot,
  subject: subjects.find((s: any) => s.id === slot.subjectId),
}));

return ok(res, "Class added successfully", {
  timetable: timetableWithSubjects,
});
  } catch (error) {
    console.error("SAVE CLASS ERROR:", error);

    return fail(
      res,
      (error as any)?.message || "Internal server error",
      500
    );
  }
};

export const getTimetableController = async (
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

    const userData = userSnap.data();

    const subjects = (userData?.subjects || []).map(formatRetrievedEntry);

    const timetable = (userData?.timetable || []).map((entry: any) => {
      const formattedEntry = formatRetrievedEntry(entry);

      return {
        ...formattedEntry,
        subject:
          subjects.find(
            (subject: any) => subject.id === formattedEntry.subjectId
          ) || null,
      };
    });

    return ok(res, "Timetable fetched", {
      timetable,
    });
  } catch (error) {
    console.error("GET TIMETABLE ERROR:", error);

    return fail(
      res,
      (error as any)?.message || "Internal server error",
      500
    );
  }
};

export const updateSubjectController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const { id, name, code, room } = req.body;

    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    if (!id) {
      return fail(res, "Subject id is required", 400);
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return fail(res, "User not found", 404);
    }

    const subjects = userSnap.data()?.subjects || [];

    const updatedSubjects = subjects.map((subject: any) =>
      subject.id === id
        ? {
            ...subject,
            name: name.trim(),
            code: code?.trim() || "",
            room: room?.trim() || "",
          }
        : subject
    );

    await userRef.update({
      subjects: updatedSubjects,
      updatedAt: Date.now(),
    });

    return ok(res, "Subject updated successfully", {
      subjects: updatedSubjects,
    });
  } catch (error) {
    console.error("UPDATE SUBJECT ERROR:", error);
    return fail(
      res,
      (error as any)?.message || "Internal server error",
      500
    );
  }
};
export const updateClassSlotController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const { id, day, startTime, endTime } = req.body;

    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    if (!id || !day || !startTime || !endTime) {
      return fail(res, "id, day, startTime and endTime are required", 400);
    }

    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);

    if (newEnd <= newStart) {
      return fail(res, "End time must be after start time", 400);
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return fail(res, "User not found", 404);
    }

    const timetable = userSnap.data()?.timetable || [];

    const target = timetable.find((slot: any) => slot.id === id);
    if (!target) {
      return fail(res, "Class not found", 404);
    }

    const clash = timetable.some((slot: any) => {
      if (slot.id === id) return false;
      if (slot.day !== day) return false;

      const slotStart = toMinutes(slot.startTime);
      const slotEnd = toMinutes(slot.endTime);

      return newStart < slotEnd && newEnd > slotStart;
    });

    if (clash) {
      return fail(res, "Time clash detected", 409);
    }

    const updatedTimetable = timetable.map((slot: any) =>
      slot.id === id ? { ...slot, day, startTime, endTime } : slot
    );

    await userRef.update({
      timetable: updatedTimetable,
      updatedAt: Date.now(),
    });

    return ok(res, "Class moved successfully", {
      timetable: updatedTimetable,
    });
  } catch (error) {
    console.error("UPDATE CLASS SLOT ERROR:", error);
    return fail(
      res,
      (error as any)?.message || "Internal server error",
      500
    );
  }
};
export const deleteSubjectController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.body;

    if (!userId) {
      return fail(res, "Unauthorized", 401);
    }

    if (!id) {
      return fail(res, "id is required", 400);
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return fail(res, "User not found", 404);
    }

    const userData = userSnap.data() || {};

    const subjects = userData.subjects || [];
    const updatedSubjects = subjects.filter((subject: any) => subject.id !== id);

    if (updatedSubjects.length === subjects.length) {
      return fail(res, "Subject not found", 404);
    }

    const timetable = userData.timetable || [];
    const updatedTimetable = timetable.filter(
      (slot: any) => slot.subjectId !== id && slot.id !== id
    );

    await userRef.update({
      subjects: updatedSubjects,
      timetable: updatedTimetable,
      updatedAt: Date.now(),
    });

    return ok(res, "Subject removed", {
      subjects: updatedSubjects,
      timetable: updatedTimetable,
    });
  } catch (error) {
    console.error("DELETE SUBJECT ERROR:", error);
    return fail(
      res,
      (error as any)?.message || "Internal server error",
      500
    );
  }
};