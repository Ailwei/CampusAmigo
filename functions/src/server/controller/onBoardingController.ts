import { Response } from "express";
import { db } from "../firebase/firebase";
import { AuthRequest } from "../midlwWare/middleWare";
import { formatRetrievedEntry } from "../utils/formatter"


const ok = (res: Response, message: string, data?: any, status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const saveClassesController = async (
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
      return fail(res, "Classes array is required", 400);
    }

    const formattedClasses = classes.map((cls: any) => {
      if (typeof cls === "string") {
        return {
          id: Date.now().toString() + Math.random(),
          name: cls.trim(),
          code: "",
          room: "",
        };
      }

      return {
        id: cls.id || Date.now().toString() + Math.random(),
        name: cls.name?.trim() || "",
        code: cls.code?.trim() || "",
        room: cls.room?.trim() || "",
      };
    });

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return fail(res, "User not found", 404);
    }

    await userRef.update({
      subjects: formattedClasses,
      onboardingCompleted: true,
      updatedAt: Date.now(),
    });

    const updatedDoc = await userRef.get();

    return ok(res, "Classes saved successfully", {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    console.error("SAVE CLASSES ERROR:", error);
    return fail(
      res,
      (error as any)?.message || "Internal server error",
      500
    );
  }
};

export const saveTimetableController = async (
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

    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
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

    const subjects = userData?.subjects || [];
    const timetable = userData?.timetable || [];

    const subjectExists = subjects.some(
      (subject: any) => subject.id === subjectId
    );

    if (!subjectExists) {
      return fail(res, "Selected subject does not exist", 404);
    }

    const clash = timetable.some((slot: any) => {
      if (slot.day !== day) return false;

      const slotStart = toMinutes(slot.startTime);
      const slotEnd = toMinutes(slot.endTime);

      return newStart < slotEnd && newEnd > slotStart;
    });

    if (clash) {
      return fail(res, "Time clash detected with existing class", 409);
    }

    const newClass = {
      id: `class_${Date.now()}`,
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

    return ok(res, "Class added to timetable", {
      timetable: updatedTimetable,
    });
  } catch (error) {
    console.error("SAVE TIMETABLE ERROR:", error);

    return fail(
      res,
      (error as any)?.message || "Internal server error",
      500
    );
  }
};


export const getSummaryController = async (
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

      const subject = subjects.find(
        (s: any) => s.id === formattedEntry.subjectId
      );

      return {
        ...formattedEntry,
        subject: subject || null,
      };
    });

    return ok(res, "Summary fetched successfully", {
      subjects,
      timetable,
    });
  } catch (error) {
    console.error("GET SUMMARY ERROR:", error);

    return fail(
      res,
      (error as any)?.message || "Internal server error",
      500
    );
  }
};

export const getWeeklyCalendarController = async (
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
    const timetable = userData?.timetable || [];

    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const sortedTimetable = timetable
      .sort((a: any, b: any) => {
        if (a.day === b.day) {
          return toMinutes(a.startTime) - toMinutes(b.startTime);
        }
        return a.day.localeCompare(b.day);
      })
      .map((entry: any) => {
        const formattedEntry = formatRetrievedEntry(entry);

        const subject = subjects.find(
          (s: any) => s.id === formattedEntry.subjectId
        );

        return {
          ...formattedEntry,
          subject: subject || null,
        };
      });

    return ok(res, "Weekly timetable fetched", {
      timetable: sortedTimetable,
    });
  } catch (error) {
    console.error("GET WEEKLY CALENDAR ERROR:", error);

    return fail(
      res,
      (error as any)?.message || "Internal server error",
      500
    );
  }
};