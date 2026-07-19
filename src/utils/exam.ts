export type RevisionTopic = { name: string; progress: number };
export type RevisionItem = { subject: string; topics: RevisionTopic[] };
export type SubjectOption = { id: string; name: string; code: string };

export const extractId = (item: any): string | undefined =>
  item?._id || item?.id || item?.subjectId || undefined;

export const toSubjectOption = (item: any): SubjectOption | null => {
  if (!item || typeof item === "string") return null;
  const id = extractId(item);
  const name = item?.name;
  if (!id || !name) return null;
  return { id: String(id), name: String(name), code: item?.code ? String(item.code) : "" };
};

export const daysLeft = (date: string) => {
  const today = new Date();
  const examDate = new Date(date);
  const diff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
};

export const countdownColor = (days: number) => {
  if (days <= 3) return "#EF4444";
  if (days <= 7) return "#F97316";
  return "#10B981";
};

export const truncateName = (name?: string, max = 20) => {
  if (!name) return "";
  return name.length > max ? `${name.slice(0, max).trimEnd()}...` : name;
};