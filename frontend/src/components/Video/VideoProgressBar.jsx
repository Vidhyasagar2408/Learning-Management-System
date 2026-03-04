export default function VideoProgressBar({ percent }) {
  return (
    <div className="rounded border border-line bg-white p-3">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>Subject progress</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-slate-200">
        <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}