import { PostEditorForm } from '@/components/admin/post-editor-form';
import { type Post } from '@/types';

export const revalidate = 0;

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const { getPostById } = await import('@/lib/db/db-service');
  const post = await getPostById(params.id);

  if (!post) {
    return (
      <div className="p-8 text-center text-xs text-text-muted space-y-3">
        <p className="text-sm font-bold text-rose-400">Artículo no encontrado en la base de datos</p>
        <p>El identificador solicitante no corresponde a ningún post registrado.</p>
      </div>
    );
  }

  return <PostEditorForm initialPost={post} />;
}
