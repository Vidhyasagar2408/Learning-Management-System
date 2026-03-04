import { useEffect, useState } from 'react';
import apiClient from '../lib/apiClient';

export default function Profile() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const subjectsRes = await apiClient.get('/subjects?page=1&pageSize=100');
      const subjects = subjectsRes.data.items || [];

      const progress = await Promise.all(
        subjects.map(async (s) => {
          try {
            const { data } = await apiClient.get(`/progress/subjects/${s.id}`);
            return { subject: s, progress: data };
          } catch (_error) {
            return { subject: s, progress: null };
          }
        })
      );

      if (mounted) {
        setStats(progress.filter((p) => p.progress));
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Profile Progress</h1>
      <div className="space-y-3">
        {stats.map((item) => (
          <div key={item.subject.id} className="rounded border border-line bg-white p-4">
            <h2 className="font-semibold">{item.subject.title}</h2>
            <p className="text-sm text-slate-600">
              {item.progress.completed_videos}/{item.progress.total_videos} completed ({item.progress.percent_complete}%)
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}