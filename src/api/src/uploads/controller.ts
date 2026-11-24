import { Hono } from "hono";
import type { AppEnv } from "../shared/env.js";
import { z } from "zod";
import { AwsV4Signer } from "aws4fetch";
import { PresignBody } from "../../../shared/schema.js";
import { ValidationError } from "../shared/errors.js";
import { config } from "../config.js";
import { randomUUID } from "node:crypto";

export const uploadsController = new Hono<AppEnv>();

uploadsController.post("/uploads/presign", async (c) => {
  const user = c.get("user") as { id: string };
  const body = PresignBody.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) throw new ValidationError("Check the highlighted fields.", body.error.flatten().fieldErrors as Record<string, string[]>);

  const fileKey = `uploads/${user.id}/${randomUUID()}/${body.data.filename.replace(/[^\w.\-]/g, "_")}`;
  const url = `${config.R2_ENDPOINT.replace(/\/$/, "")}/${config.R2_BUCKET}/${fileKey}`;
  const signer = new AwsV4Signer({
    url,
    method: "PUT",
    accessKeyId: config.R2_ACCESS_KEY_ID,
    secretAccessKey: config.R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
    headers: { "content-type": body.data.contentType },
  });
  const signed = await signer.sign();
  return c.json({
    uploadUrl: signed.url.toString(),
    fileKey,
    publicUrl: `${config.R2_PUBLIC_BASE.replace(/\/$/, "")}/${fileKey}`,
    expiresIn: 3600,
  });
});
