import { z } from "zod";

// ---- enums (mirror DB check constraints) ----
export const Platform = z.enum(["youtube", "twitch"]);
export const PostPlatform = z.enum(["tiktok", "shorts", "reels", "x"]);
export const ProjectStatus = z.enum(["processing", "ready", "failed"]);
export const ClipStatus = z.enum(["pending", "ready", "rendering", "rendered", "failed"]);
export const PostStatus = z.enum(["scheduled", "reminder_due", "posted", "failed"]);
export const PresetKind = z.enum(["captions", "layouts", "looks", "hooks", "export", "posting"]);
export const JobType = z.enum(["import", "render"]);
export const JobStatus = z.enum(["queued", "running", "done", "failed", "dead"]);
export const LedgerKind = z.enum(["reserve", "charge", "refund", "reset"]);
export const PlanId = z.enum(["free", "pro", "creator", "agency"]);
export const LayoutId = z.enum(["auto", "split", "face"]);

// ---- entities ----
export const Word = z.object({
  w: z.string(),
  start: z.number(),
  end: z.number(),
  cut: z.boolean().optional(),
});
export type Word = z.infer<typeof Word>;

export const ClipSettings = z.object({
  layout: LayoutId.default("auto"),
  presetId: z.string().optional(),
  caption: z.record(z.string(), z.unknown()).default({}),
  trim: z.object({ start: z.number(), end: z.number() }).optional(),
});
export type ClipSettings = z.infer<typeof ClipSettings>;

export const Clip = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  start: z.number(),
  end: z.number(),
  duration: z.number(),
  score: z.number().int().min(0).max(100),
  reason: z.string().default(""),
  status: ClipStatus.default("pending"),
  words: z.array(Word).default([]),
  settings: ClipSettings.default({ layout: "auto", caption: {} }),
  fileKey: z.string().nullable().default(null),
  thumbKey: z.string().nullable().default(null),
});
export type Clip = z.infer<typeof Clip>;

export const Project = z.object({
  id: z.string(),
  userId: z.string(),
  sourceUrl: z.string(),
  platform: Platform.nullable(),
  sourceId: z.string().nullable(),
  title: z.string().nullable(),
  channel: z.string().nullable(),
  durationSec: z.number().nullable(),
  thumbnailUrl: z.string().nullable(),
  status: ProjectStatus,
  error: z.string().nullable().default(null),
  clipIds: z.array(z.string()).default([]),
  rightsConfirmedAt: z.string().nullable(),
  idempotencyKey: z.string().nullable().default(null),
  createdAt: z.string(),
});
export type Project = z.infer<typeof Project>;

export const PresetSettings = z.object({
  style: z.string().default("pop"),
  color: z.string().default("#BDEF72"),
  desc: z.string().default(""),
});
export type PresetSettings = z.infer<typeof PresetSettings>;

export const Preset = z.object({
  id: z.string(),
  ownerId: z.string().nullable(),
  name: z.string(),
  kind: PresetKind,
  settings: PresetSettings,
  isDefault: z.boolean().default(false),
  mine: z.boolean().default(false),
});
export type Preset = z.infer<typeof Preset>;

export const ScheduledPost = z.object({
  id: z.string(),
  clipId: z.string(),
  platform: PostPlatform,
  time: z.string(),
  status: PostStatus.default("scheduled"),
});
export type ScheduledPost = z.infer<typeof ScheduledPost>;

export const Profile = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable().default(null),
  plan: PlanId.default("free"),
});
export type Profile = z.infer<typeof Profile>;

export const CreditsInfo = z.object({
  used: z.number(),
  total: z.number(),
  left: z.number(),
  resetsAt: z.string().nullable(),
});
export type CreditsInfo = z.infer<typeof CreditsInfo>;

// ---- jobs / events ----
export const JobProgressEvent = z.object({
  type: z.enum(["job.progress", "project.updated", "clip.ready"]),
  projectId: z.string().optional(),
  clipId: z.string().optional(),
  jobId: z.string().optional(),
  stage: z.string().optional(),
  pct: z.number().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
});
export type JobProgressEvent = z.infer<typeof JobProgressEvent>;

// ---- API problem body ----
export const Problem = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string().optional(),
  code: z.string(),
  request_id: z.string(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});
export type Problem = z.infer<typeof Problem>;

// ---- request bodies ----
export const CreateProjectBody = z.object({
  url: z.string().min(1).max(2048),
  rightsConfirmed: z.literal(true),
  layout: LayoutId.default("auto"),
  presetId: z.string().optional(),
});
export type CreateProjectBody = z.infer<typeof CreateProjectBody>;

export const PatchClipBody = z.object({
  title: z.string().min(1).max(200).optional(),
  settings: ClipSettings.partial().optional(),
  words: z.array(Word).optional(),
}).strict();
export type PatchClipBody = z.infer<typeof PatchClipBody>;

export const CreatePresetBody = z.object({
  name: z.string().min(1).max(80),
  kind: PresetKind,
  settings: PresetSettings.partial().default({}),
}).strict();
export type CreatePresetBody = z.infer<typeof CreatePresetBody>;

export const CreatePostBody = z.object({
  clipId: z.string().min(1),
  platform: PostPlatform,
  time: z.string().regex(/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/, "Use an ISO datetime like 2026-11-28T18:00"),
}).strict();
export type CreatePostBody = z.infer<typeof CreatePostBody>;

export const PatchPostBody = z.object({
  time: z.string().optional(),
  status: PostStatus.optional(),
}).strict();
export type PatchPostBody = z.infer<typeof PatchPostBody>;

export const PresignBody = z.object({
  filename: z.string().min(1).max(300),
  contentType: z.string().regex(/^video\//),
  sizeBytes: z.number().int().positive().max(8 * 1024 * 1024 * 1024),
}).strict();
export type PresignBody = z.infer<typeof PresignBody>;
