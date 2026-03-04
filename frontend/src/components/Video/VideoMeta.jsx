export default function VideoMeta({ title, description }) {
  return (
    <div className="rounded border border-line bg-white p-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{description || 'No description'}</p>
    </div>
  );
}