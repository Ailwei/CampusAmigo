import { ClassSlot } from "@/context/onboardingContext";
import { useMemo } from "react";

export type ClassStatus = "now" | "soon" | "later";

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export function getClassStatus(item: ClassSlot, nowMinutes: number): ClassStatus {
  const start = toMinutes(item.startTime);
  const end = toMinutes(item.endTime);
  if (start <= nowMinutes && nowMinutes < end) return "now";
  if (start - nowMinutes <= 30) return "soon";
  return "later";
}

export function statusLabel(item: ClassSlot, status: ClassStatus, nowMinutes: number): string {
  if (status === "now") return "NOW";
  if (status === "soon") return `IN ${toMinutes(item.startTime) - nowMinutes}M`;
  return item.startTime;
}

export function useTodaySchedule(timetable: ClassSlot[]) {
  return useMemo(() => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    const todaysClasses = timetable.filter((item) => item.day.startsWith(today));

    const upcomingClasses = [...todaysClasses]
      .filter((item) => toMinutes(item.startTime) > nowMinutes)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    const relevantClasses = [...todaysClasses]
      .filter((item) => toMinutes(item.endTime) > nowMinutes)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    const currentClass = relevantClasses.find(
      (item) => toMinutes(item.startTime) <= nowMinutes && toMinutes(item.endTime) > nowMinutes
    );

    const nextClass = upcomingClasses[0];

    return {
      nowMinutes,
      todaysClasses,
      relevantClasses,
      currentClass,
      nextClass,
    };
  }, [timetable]);
}