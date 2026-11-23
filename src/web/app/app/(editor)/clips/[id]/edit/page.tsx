import { clipById, clipsOf, clips } from "@/lib/mock";

export function generateStaticParams() {
  return clips.map((c) => ({ id: c.id }));
}
import Workspace from "@/components/app/Workspace";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clip = clipById(id) ?? clipById("c1")!;
  return <Workspace clip={clip} siblings={clipsOf(clip.projectId)} />;
}
