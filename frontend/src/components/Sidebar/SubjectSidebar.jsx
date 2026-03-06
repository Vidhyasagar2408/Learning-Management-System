import { Link } from 'react-router-dom';

export default function SubjectSidebar({ subjectId, tree, currentVideoId }) {
  if (!tree) return null;

  return (
    <aside className="w-full rounded border border-line bg-white p-3 md:w-80">
      <h2 className="mb-3 text-sm font-semibold">{tree.title}</h2>
      <div className="space-y-3">
        {tree.sections.map((section) => (
          <div key={section.id}>
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">{section.title}</p>
            <div className="space-y-1">
              {section.videos.map((video) => {
                const active = Number(video.id) === Number(currentVideoId);
                return (
                  <Link
                    key={video.id}
                    to={`/courses/${subjectId}/video/${video.id}`}
                    className={`block rounded px-2 py-1 text-sm ${active ? 'bg-accentSoft text-accent' : 'hover:bg-slate-50'} ${video.locked ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    {video.title} {video.is_completed ? '(done)' : ''}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
