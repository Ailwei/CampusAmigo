import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

export function configureGoogle() {
  GoogleSignin.configure({
    webClientId: Constants.expoConfig?.extra?.WEB_CLIENT_ID,
  });
}
export async function signInWithGoogle() {
 await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });


  const userInfo = await GoogleSignin.signIn();
  const user = await GoogleSignin.getCurrentUser();
  const tokens = await GoogleSignin.getTokens();

  return {
    idToken: tokens.idToken,
    accessToken: tokens.accessToken,
    user,
    userInfo,
  };
}