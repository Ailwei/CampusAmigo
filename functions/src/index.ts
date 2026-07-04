import express from "express";
import cors from "cors";
import router from "./server/routes/route";
import { onRequest } from "firebase-functions/v2/https";
import dotenv from "dotenv";
import path from "path";


dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ type: "application/json" }));


app.use("/", router);

export const api = onRequest(
  { region: "us-central1" },
  app
);
