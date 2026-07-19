export type RawTopic = string | { name: string; progress?: number };

export type Topic = {
  name: string;
  progress: number;
};

export type RawTaskItem = {
  _id?: string;
  createdAt: number;
  date: string;
  assignmentId: string;
  subject: string;
  subjectId: string;
  topics: Topic[];
};

export type TopicTask = {
  key: string;
  taskId: string | undefined;
  createdAt: number;
  subject: string;
  assignmentId: string;
  subjectId: string;
  date: string;
  topicIndex: number;
  topicName: string;
  progress: number;
};

export type TaskGroup = {
  key: string;
  taskId: string | undefined;
  createdAt: number;
  assignmentId: string;
  subject: string;
  subjectId: string;
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

export const getTopicName = (topic: RawTopic): string => (typeof topic === "string" ? topic : topic?.name ?? "");

export const flattenToTasks = (items: RawTaskItem[]): TopicTask[] => {
  const tasks: TopicTask[] = [];

  items.forEach((task) => {
    const groupKey = (task._id ?? task.createdAt).toString();

    task.topics.forEach((topic, index) => {
      tasks.push({
        key: `${groupKey}-${index}`,
        assignmentId: task.assignmentId,
        taskId: task._id,
        createdAt: task.createdAt,
        subject: task.subject,
        subjectId: task.subjectId,
        date: task.date,
        topicIndex: index,
        topicName: getTopicName(topic),
        progress: topic.progress ?? 0,
      });
    });
  });

  return tasks.sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
};

export const groupTasks = (tasks: TopicTask[]): TaskGroup[] => {
  const groups = new Map<string, TaskGroup>();

  tasks.forEach((task) => {
    const key = task.assignmentId;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        assignmentId: key,
        subject: task.subject,
        subjectId: task.subjectId,
        date: task.date,
        topics: [],
        taskId: undefined,
        createdAt: 0,
      });
    }

    groups.get(key)!.topics.push(task);
  });

  return Array.from(groups.values()).sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
};