import React, { createContext, useState, useContext, ReactNode } from "react";

export type ClassItem = {
  [x: string]: any;
  name: string;
  code: string;
  room: string;
};

export interface ClassSlot {
  room: any;
  lecturer: any;
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  subject?: ClassItem;
  updatedAt?: number;
}

interface OnboardingContextType {
  classes: ClassItem[];
  setClasses: React.Dispatch<React.SetStateAction<ClassItem[]>>;

  timetable: ClassSlot[];
  setTimetable: React.Dispatch<React.SetStateAction<ClassSlot[]>>;

  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const OnboardingProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [timetable, setTimetable] = useState<ClassSlot[]>([]);

   const resetOnboarding = () => {
    setClasses([]);
    setTimetable([]);
  };

  return (
    <OnboardingContext.Provider
      value={{
        classes,
        setClasses,
        timetable,
        setTimetable,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      "useOnboarding must be used within OnboardingProvider"
    );
  }

  return context;
};

export default OnboardingProvider;