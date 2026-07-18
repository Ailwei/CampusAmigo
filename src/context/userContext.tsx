import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserProfile } from "@/utils/user";
import { getToken } from "@/utils/token";

type UserContextType = {
  user: any;
  loading: boolean;
  loadUser: () => Promise<any>;
  setUser: (user: any) => void;
  clearUser: () => void;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadUser = async () => {
    try {
      setLoading(true);

      const profile = await getUserProfile();

      if (!profile) {
        setUser(null);
        return null;
      }

      setUser(profile);
      return profile;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = await getToken();

      if (token) {
        await loadUser();
      }
    };

    init();
  }, []);

  const clearUser = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        loadUser,
        setUser,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
};