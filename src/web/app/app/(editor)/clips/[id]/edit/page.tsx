export const instant = false;
import { clipById, clipsOf } from "@/lib/mock";
import Workspace from "@/components/app/Workspace";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clip = clipById(id) ?? clipById("c1")!;
  return <Workspace clip={clip} siblings={clipsOf(clip.projectId)} />;
}
