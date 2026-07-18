const COLORS = {
  bgTop: '#EAF2FD',
  bgBottom: '#D9E7FB',
  navy: '#152A54',
  navySoft: '#41527A',
  blue: '#2F6FE0',
  blueLight: '#5B93F2',
  orange: '#F7860C',
  orangeLight: '#FFA53D',
  green: '#2FA36B',
  card: '#FFFFFF',
  ring: 'rgba(47,111,224,0.28)',
  ring2: 'rgba(247,134,12,0.22)',
  red:'rgba(243, 10, 10, 0.22)',

  paper: '#F7F8FC',
  rule: '#E7EAF2',
  ruleSoft: '#F0F2F8',
  today: '#EEF2FF',
  now: '#FF6B4A',
};

export default COLORS;

const COLOR_KEYS = ["blue", "orange", "green", "navy", "navySoft"] as const;
type ColorKey = typeof COLOR_KEYS[number];

export const getSubjectColor = (subject: string): string => {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash += subject.charCodeAt(i);
  }
  const key: ColorKey = COLOR_KEYS[hash % COLOR_KEYS.length];
  return COLORS[key];
};




const PALETTE = [
  { accent: "#4C6FFF", tint: "#EEF1FF" },
  { accent: "#FF7A59", tint: "#FFF1EC" },
  { accent: "#22B07D", tint: "#E9FBF3" },
  { accent: "#B45CFF", tint: "#F6EEFF" },
  { accent: "#FFB020", tint: "#FFF7E6" },
  { accent: "#00B4D8", tint: "#E6FAFD" },
  { accent: "#FF5C8A", tint: "#FFEDF3" },
  { accent: "#6D5DF6", tint: "#EFEDFE" },
];

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getSubjectStyle(subject: string) {
  const idx = hashString(subject || "default") % PALETTE.length;
  return PALETTE[idx];
}


export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function formatDuration(startTime: string, endTime: string): string {
  const mins = timeToMinutes(endTime) - timeToMinutes(startTime);
  if (mins <= 0) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}


