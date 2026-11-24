import { pino } from "pino";
import { config } from "../config.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  base: { service: "kivlo-api" },
  // never log secrets: redact auth headers + body tokens
  redact: {
    paths: ["req.headers.authorization", "res.headers['set-cookie']", "*.token", "*.jwt", "*.secret"],
    censor: "[redacted]",
  },
});
