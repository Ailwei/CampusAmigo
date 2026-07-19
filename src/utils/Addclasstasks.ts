export type Subject = {
  id: string;
  name: string;
  code: string;
  room: string;
};

let idCounter = 0;
export const makeId = () => `subj_${Date.now()}_${idCounter++}`;