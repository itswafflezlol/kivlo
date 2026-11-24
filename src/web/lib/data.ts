// Single place pages get data from. With NEXT_PUBLIC_API_URL unset everything
// resolves to the mock dataset so the Pages demo never changes.
import { api, apiEnabled, ApiError } from "./api-client";
import { user, projects, projectById, clipsOf, type Project, type Clip } from "./mock";

export { apiEnabled, ApiError };

export type ApiProject = {
  id: string; title: string | null; channel: string | null; platform: "youtube" | "twitch";
  sourceUrl: string; durationSec: number | null; status: "processing" | "ready" | "failed";
  stage: string | null; progress: number; error: string | null; createdAt: string;
};

export type Me = {
  profile: { id: string; name: string; email: string; plan: string };
  credits: { used: number; total: number; left: number; resetsAt: string };
};

const mockMe: Me = {
  profile: { id: "mock", name: user.name, email: user.email, plan: user.plan },
  credits: { used: user.creditsUsed, total: user.creditsTotal, left: user.creditsTotal - user.creditsUsed, resetsAt: user.renewsAt },
};

export const getMe = (): Promise<Me> =>
  apiEnabled ? api<Me>("/v1/me") : Promise.resolve(mockMe);

export const getProjects = (): Promise<(Project | ApiProject)[]> =>
  apiEnabled ? api<{ projects: ApiProject[] }>("/v1/projects").then((r) => r.projects) : Promise.resolve(projects);

export const getProject = (id: string): Promise<Project | ApiProject | undefined> =>
  apiEnabled ? api<{ project: ApiProject }>(`/v1/projects/${id}`).then((r) => r.project) : Promise.resolve(projectById(id));

export const getClips = (projectId: string): Promise<Clip[]> =>
  apiEnabled ? api<{ clips: Clip[] }>(`/v1/projects/${projectId}/clips`).then((r) => r.clips) : Promise.resolve(clipsOf(projectId));

export type NewProject = { url: string; rightsConfirmed: true; layout: string; presetId?: string; idempotencyKey: string };

export async function createProject(body: NewProject): Promise<{ id: string }> {
  if (!apiEnabled) return { id: "new-demo" };
  const r = await api<{ project: { id: string } }>("/v1/projects", {
    method: "POST",
    body,
    headers: { "idempotency-key": body.idempotencyKey },
  });
  return { id: r.project.id };
}

export const eventsTicket = (): Promise<{ ticket: string }> =>
  api<{ ticket: string }>("/v1/events/ticket", { method: "POST" });

export const eventsUrl = (ticket: string) =>
  `${process.env.NEXT_PUBLIC_API_URL}/v1/events?ticket=${encodeURIComponent(ticket)}`;
