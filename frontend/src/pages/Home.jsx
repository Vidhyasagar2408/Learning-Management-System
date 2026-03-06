import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const [items, setItems] = useState([]);
  const [progressBySubject, setProgressBySubject] = useState({});
  const [enrolledBySubject, setEnrolledBySubject] = useState({});
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await apiClient.get('/subjects?page=1&pageSize=24');
        const subjects = res.data.items || [];
        if (!mounted) return;
        setItems(subjects);

        if (isAuthenticated && subjects.length > 0) {
          const [stats, enrollments] = await Promise.all([
            Promise.all(subjects.map(async (subject) => {
              try {
                const pr = await apiClient.get(`/progress/subjects/${subject.id}`);
                return [subject.id, pr.data.percent_complete || 0];
              } catch (_error) {
                return [subject.id, 0];
              }
            })),
            apiClient.get('/enrollments/me').then((res) => res.data.items || []).catch(() => [])
          ]);
          if (mounted) {
            setProgressBySubject(Object.fromEntries(stats));
            const enrolledMap = {};
            enrollments.forEach((e) => {
              enrolledMap[e.subject_id] = true;
            });
            setEnrolledBySubject(enrolledMap);
          }
        } else if (mounted) {
          setProgressBySubject({});
          setEnrolledBySubject({});
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
      <h1 className="mb-4 text-2xl font-semibold">Published Courses</h1>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <div className="rounded border border-line bg-white p-5 text-sm text-slate-600">
          No published courses found yet. Add or publish subjects in the database to show them here.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((subject) => (
            <div
              key={subject.id}
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
              <p className="mt-2 text-sm font-semibold text-slate-800">Price: Rs. {Number(subject.price_amount || 0).toFixed(2)}</p>
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
              <div className="mt-3 flex items-center gap-2">
                <Link to={`/courses/${subject.id}`} className="inline-block text-sm text-accent">Open course</Link>
                <button
                  type="button"
                  className="rounded bg-accent px-3 py-1 text-xs text-white"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: `/courses/${subject.id}/purchase` } });
                      return;
                    }
                    navigate(`/courses/${subject.id}/purchase`);
                  }}
                >
                  {enrolledBySubject[subject.id] ? 'View purchase' : 'Enroll'}
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
