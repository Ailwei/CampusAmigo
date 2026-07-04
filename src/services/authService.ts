import api from "../utils/api";


export const googleLogin = async (idToken: string) => {
  const res = await api.post("/auth/google", { idToken });
  return res.data;
};