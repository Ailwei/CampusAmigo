

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
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

const FULL_DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function normalizeDay(raw: string): string {
  const clean = (raw || "").trim().toLowerCase();

  const fullMatch = FULL_DAYS.find((d) => d.toLowerCase() === clean);
  if (fullMatch) return fullMatch;

  const abbrKey = clean.slice(0, 3);
  if (DAY_MAP[abbrKey]) return DAY_MAP[abbrKey];

  console.warn("mapTimetable: unrecognized day value ->", raw);
  return raw;
}

export function mapTimetable(raw: ClassSlot[]): ClassEntry[] {
  return raw.map((slot) => {
    const subj = slot.subject as any;

    const subjectName =
      subj?.name || subj?.title || slot.name || slot.title || "Untitled";

    const code = subj?.code || slot.code || undefined;

    const room = subj?.venue || subj?.room || slot.venue || undefined;

    return {
      day: normalizeDay(slot.day),
      subject: subjectName,
      code,
      startTime: slot.startTime,
      endTime: slot.endTime,
      room,
    };
  });
}