import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const [items, setItems] = useState([]);
  const [progressBySubject, setProgressBySubject] = useState({});
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await apiClient.get('/subjects?page=1&pageSize=24');
        const subjects = res.data.items || [];
        if (!mounted) return;
        setItems(subjects);

        if (isAuthenticated && subjects.length > 0) {
          const stats = await Promise.all(
            subjects.map(async (subject) => {
              try {
                const pr = await apiClient.get(`/progress/subjects/${subject.id}`);
                return [subject.id, pr.data.percent_complete || 0];
              } catch (_error) {
                return [subject.id, 0];
              }
            })
          );
          if (mounted) setProgressBySubject(Object.fromEntries(stats));
        } else if (mounted) {
          setProgressBySubject({});
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Published Subjects</h1>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <div className="rounded border border-line bg-white p-5 text-sm text-slate-600">
          No published courses found yet. Add or publish subjects in the database to show them here.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((subject) => (
            <Link
              key={subject.id}
              to={`/subjects/${subject.id}`}
              className="group block overflow-hidden rounded border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <img
                src={subject.thumbnail_url || 'https://placehold.co/640x360/e2e8f0/64748b?text=Course'}
                alt={`${subject.title} thumbnail`}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
              <div className="p-4">
              <h2 className="font-semibold group-hover:text-accent">{subject.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{subject.description}</p>
              {isAuthenticated ? (
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>Completion</span>
                    <span>{progressBySubject[subject.id] || 0}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-slate-200">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, progressBySubject[subject.id] || 0))}%` }}
                    />
                  </div>
                </div>
              ) : null}
              <span className="mt-3 inline-block text-sm text-accent">Open subject</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
