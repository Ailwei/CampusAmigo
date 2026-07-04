import admin from "firebase-admin";

if (process.env.FUNCTIONS_EMULATOR) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8086";
}

admin.initializeApp();

export const db = admin.firestore();