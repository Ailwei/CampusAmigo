export type RawTopic = string | { name: string; progress?: number };

export type Topic = {
  name: string;
  progress: number;
};

export type RawRevisionItem = {
  _id?: string;
  createdAt: number;
  subjectId: string,
  date: string;
  subject: string;
  topics: Topic[];
};

export type TopicTask = {
  key: string;
  revisionId: string | undefined;
  createdAt: number;
  subject: string;
  subjectId: string,
  date: string;
  topicIndex: number;
  topicName: string;
  progress: number;
};

export type RevisionGroup = {
  key: string;
  revisionId: string | undefined;
  subjectId: string,
  createdAt: number;
  subject: string;
  date: string;
  topics: TopicTask[];
};

export const toDateString = (date: Date) => date.toISOString().split("T")[0];

export const daysUntil = (date: string) => {
  const today = new Date();
  const target = new Date(date);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const dueColor = (days: number) => {
  if (days <= 1) return "#EF4444";
  if (days <= 5) return "#F97316";
  return "#10B981";
};

export const dueBannerColors = (days: number) => {
  if (days <= 1) return { bg: "#FEE2E2", text: "#B91C1C" };
  if (days <= 5) return { bg: "#FFEDD5", text: "#C2410C" };
  return { bg: "#DCFCE7", text: "#15803D" };
};

export const getTopicName = (topic: RawTopic): string =>
  typeof topic === "string" ? topic : topic?.name ?? "";

export const flattenToTasks = (items: RawRevisionItem[]): TopicTask[] => {
  const tasks: TopicTask[] = [];

  items.forEach((revision) => {
    const groupKey = (revision._id ?? revision.createdAt).toString();
    revision.topics.forEach((topic, index) => {
      tasks.push({
        key: `${groupKey}-${index}`,
        revisionId: revision._id,
        createdAt: revision.createdAt,
        subjectId: revision.subjectId,
        subject: revision.subject,
        date: revision.date,
        topicIndex: index,
        topicName: getTopicName(topic),
        progress: topic.progress ?? 0,
      });
    });
  });

  return tasks.sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
};

export const groupTasks = (tasks: TopicTask[]): RevisionGroup[] => {
  const groups = new Map<string, RevisionGroup>();
  tasks.forEach((task) => {
    const groupKey = (task.revisionId ?? task.createdAt)?.toString();
    const existing = groups.get(groupKey);
    if (existing) {
      existing.topics.push(task);
    } else {
      groups.set(groupKey, {
        key: groupKey,
        revisionId: task.revisionId,
        createdAt: task.createdAt,
        subjectId: task.subjectId,
        subject: task.subject,
        date: task.date,
        topics: [task],
      });
    }
  });
  return Array.from(groups.values()).sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
};