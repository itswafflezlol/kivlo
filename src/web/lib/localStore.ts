// Local persistence for the demo account. Pages read user-visible projects and
// scheduled posts from here (localStorage "kivlo.local") so the app starts as a
// fresh account — the mock.ts demo dataset stays reachable only via direct
// project/clip links. SSR-safe (server snapshot is empty), cross-tab via the
// `storage` event, same-tab via a custom event.
import { useSyncExternalStore } from "react";
import {
  clipById, creditsFor, projectById as demoProjectById,
  type Project, type ScheduledPost, type PostPlatform,
} from "./mock";

export type LocalData = {
  projects: Project[];
  renames: Record<string, string>;
  deleted: string[];
  posts: ScheduledPost[];
  readNotifs: string[];
};

export const EMPTY_LOCAL: LocalData = { projects: [], renames: {}, deleted: [], posts: [], readNotifs: [] };
const KEY = "kivlo.local";
const EVENT = "kivlo:local";

let raw = "";
let cache: LocalData = EMPTY_LOCAL;

function getSnapshot(): LocalData {
  let s: string | null = null;
  try {
    s = localStorage.getItem(KEY);
  } catch {
    return cache;
  }
  if (s === null) return EMPTY_LOCAL;
  if (s !== raw) {
    try {
      cache = { ...EMPTY_LOCAL, ...(JSON.parse(s) as Partial<LocalData>) };
      raw = s;
    } catch {
      return cache;
    }
  }
  return cache;
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

function write(d: LocalData) {
  const s = JSON.stringify(d);
  try {
    localStorage.setItem(KEY, s);
  } catch {}
  raw = s;
  cache = d;
  window.dispatchEvent(new Event(EVENT));
}

const update = (f: (d: LocalData) => LocalData) => write(f(getSnapshot()));

export const addProject = (p: Project) =>
  update((d) => ({
    ...d,
    // re-importing a deleted project resurrects it
    deleted: d.deleted.filter((x) => x !== p.id),
    projects: d.projects.some((x) => x.id === p.id) ? d.projects : [p, ...d.projects],
  }));

export const renameProject = (id: string, title: string) =>
  update((d) => ({ ...d, renames: { ...d.renames, [id]: title } }));

export const deleteProject = (id: string) =>
  update((d) => (d.deleted.includes(id) ? d : { ...d, deleted: [...d.deleted, id] }));

// same `deleted` set hides clips too — ids can't collide (c* vs project ids)
export const deleteClip = deleteProject;

export const schedulePost = (p: Omit<ScheduledPost, "id"> & { id?: string }) =>
  update((d) => ({
    ...d,
    posts: [...d.posts, { ...p, id: p.id ?? `lp-${Date.now().toString(36)}-${d.posts.length}` }],
  }));

export const updatePost = (id: string, patch: { time?: string; platform?: PostPlatform; status?: ScheduledPost["status"] }) =>
  update((d) => ({ ...d, posts: d.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

export const deletePost = (id: string) =>
  update((d) => ({ ...d, posts: d.posts.filter((p) => p.id !== id) }));

export const markNotifRead = (id: string) =>
  update((d) => (d.readNotifs.includes(id) ? d : { ...d, readNotifs: [...d.readNotifs, id] }));

export const markAllNotifsRead = (ids: string[]) =>
  update((d) => ({ ...d, readNotifs: [...new Set([...d.readNotifs, ...ids])] }));

/** Local ∪ demo project, minus deleted, with renames applied. For project pages. */
export function projectView(id: string, d: LocalData): Project | undefined {
  if (d.deleted.includes(id)) return undefined;
  const p = d.projects.find((x) => x.id === id) ?? demoProjectById(id);
  return p && d.renames[id] ? { ...p, title: d.renames[id] } : p;
}

export function useLocalData() {
  const d = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_LOCAL);
  const projects = d.projects
    .filter((p) => !d.deleted.includes(p.id))
    .map((p) => (d.renames[p.id] ? { ...p, title: d.renames[p.id] } : p));
  const visibleIds = new Set(projects.map((p) => p.id));
  // clips the user can reach: only those of visible local projects, minus deleted clips
  const clipIds = new Set(projects.flatMap((p) => p.clipIds).filter((id) => !d.deleted.includes(id)));
  const posts = d.posts.filter((p) => {
    const c = clipById(p.clipId);
    return !!c && !d.deleted.includes(c.projectId) && !d.deleted.includes(p.clipId);
  });
  const creditsUsed = projects.reduce((a, p) => a + creditsFor(p.sourceLength / 60), 0);
  return {
    data: d,
    projects,
    posts,
    visibleIds,
    clipIds,
    creditsUsed,
    projectById: (id: string) => projectView(id, d),
    isDeleted: (id: string) => d.deleted.includes(id),
    addProject,
    renameProject,
    deleteProject,
    deleteClip,
    schedulePost,
    updatePost,
    deletePost,
    readNotifs: d.readNotifs,
    markNotifRead,
    markAllNotifsRead,
  };
}
