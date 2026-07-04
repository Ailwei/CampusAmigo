import React, { createContext, useState, useContext, ReactNode } from "react";

interface ClassSlot {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
}

interface OnboardingContextType {
  classes: string[];
  setClasses: React.Dispatch<React.SetStateAction<string[]>>;
  timetable: ClassSlot[];
  setTimetable: React.Dispatch<React.SetStateAction<ClassSlot[]>>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [classes, setClasses] = useState<string[]>([]);
  const [timetable, setTimetable] = useState<ClassSlot[]>([]);

  return (
    <OnboardingContext.Provider value={{ classes, setClasses, timetable, setTimetable }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
};
export default OnboardingProvider;

