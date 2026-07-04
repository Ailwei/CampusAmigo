import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

export async function verifyToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_WEB_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) throw new Error("Invalid Google token");

  return payload;
}