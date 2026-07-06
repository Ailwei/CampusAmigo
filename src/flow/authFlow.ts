import { signInWithGoogle } from "@/utils/authGoogle";
import { clearAuthSession, saveToken } from "@/utils/token";
import { googleLogin } from "../services/authService";

export const googleAuthFlow = async () => {
  const { idToken } = await signInWithGoogle();

  if (!idToken) {
    throw new Error("Google authentication failed");
  }

  const data = await googleLogin(idToken);

  if (!data?.success) {
    throw new Error(data?.message || "Login failed");
  }

  const token = data?.token;

  if (!token) {
    throw new Error("No token returned from server");
  }

  await clearAuthSession();
  await saveToken({ token });

  return data;
};