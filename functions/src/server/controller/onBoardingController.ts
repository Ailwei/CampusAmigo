import { Response } from "express";
import { db } from "../firebase/firebase";
import { AuthRequest } from "../midlwWare/middleWare";

const ok = (res: Response, message: string, data?: any, status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const saveClassesController = async (req: AuthRequest, res: Response) => {
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
        return { name: cls, code: "" };
      }
      return {
        name: cls.name,
        code: cls.code || "",
      };
    });

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return fail(res, "User not found", 404);
    }

    await userRef.update({
      classes: formattedClasses,
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
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};

export const saveTimetableController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { subject, day, startTime, endTime } = req.body;

    if (!userId) return fail(res, "Unauthorized", 401);
    if (!subject || !day || !startTime || !endTime) {
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
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    const timetable = userData?.timetable || [];

    const clash = timetable.some((slot: any) => {
      if (slot.day !== day) return false;
      const slotStart = toMinutes(slot.startTime);
      const slotEnd = toMinutes(slot.endTime);
      return newStart < slotEnd && newEnd > slotStart;
    });

    if (clash) {
      return fail(res, "Time clash detected with existing class", 409);
    }

    const updatedTimetable = [...timetable, { subject, day, startTime, endTime }];
    await userRef.update({ timetable: updatedTimetable, updatedAt: Date.now() });

    return ok(res, "Class added to timetable", { timetable: updatedTimetable });
  } catch (err) {
    console.error("SAVE TIMETABLE ERROR:", err);
    return fail(res, (err as any)?.message || "Internal server error", 500);
  }
};


export const getSummaryController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return fail(res, "Unauthorized", 401);

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return fail(res, "User not found", 404);

    const userData = userSnap.data();
    return ok(res, "Summary fetched successfully", {
      classes: userData?.classes || [],
      timetable: userData?.timetable || [],
    });
  } catch (error) {
    console.error("GET SUMMARY ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};


export const getWeeklyCalendarController = async (req: AuthRequest, res: Response) => {
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
    const timetable = userData?.timetable || [];

    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const sortedTimetable = timetable.sort((a: any, b: any) => {
      if (a.day === b.day) {
        return toMinutes(a.startTime) - toMinutes(b.startTime);
      }
      return a.day.localeCompare(b.day);
    });

    return ok(res, "Weekly timetable fetched", { timetable: sortedTimetable });
  } catch (error) {
    console.error("GET WEEKLY CALENDAR ERROR:", error);
    return fail(res, (error as any)?.message || "Internal server error", 500);
  }
};