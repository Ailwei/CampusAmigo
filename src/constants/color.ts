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

