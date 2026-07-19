export type AssignmentTopic = { name: string; progress: number };
export type TaskItem = { assignmentId: string; subject: string; topics: AssignmentTopic[] };
export type SubjectOption = { id: string; name: string };

export const extractId = (item: any): string | undefined =>
  item?._id || item?.id || item?.subjectId || undefined;

export const toSubjectOption = (item: any): SubjectOption | null => {
  if (!item || typeof item === "string") return null;
  const id = extractId(item);
  const name = item?.name;
  if (!id || !name) return null;
  return { id: String(id), name: String(name) };
};

export const daysLeft = (date: string) => {
  const today = new Date();
  const dueDate = new Date(date);
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const countdownColor = (days: number) => {
  if (days <= 1) return "#EF4444";
  if (days <= 5) return "#F97316";
  return "#10B981";
};