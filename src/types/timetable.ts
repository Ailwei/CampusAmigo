

export type ClassEntry = {
  day: string;
  subject: string;
  code?: string;
  startTime: string;
  endTime: string;
  room?: string;
  lecturer?: string;
};

export type ClassSlot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  name?: string;
  title?: string;
  code?: string;
  venue?: string;
  subject?: { name?: string; code?: string; [key: string]: any };
  subjectId?: string;
};

const DAY_MAP: Record<string, string> = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};


export function mapTimetable(raw: ClassSlot[]): ClassEntry[] {
  return raw.map((slot) => {
    const subj = slot.subject as any;

    const subjectName =
      subj?.name || subj?.title || slot.name || slot.title || "Untitled";

    const code = subj?.code || slot.code || undefined;

    const room = subj?.venue || subj?.room || slot.venue || undefined;

    return {
      day: DAY_MAP[slot.day] || slot.day,
      subject: subjectName,
      code,
      startTime: slot.startTime,
      endTime: slot.endTime,
      room,
    };
  });
}