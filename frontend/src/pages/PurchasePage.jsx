import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../lib/apiClient';

export default function PurchasePage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [courseRes, statusRes] = await Promise.all([
          apiClient.get(`/subjects/${subjectId}`),
          apiClient.get(`/enrollments/${subjectId}/status`)
        ]);
        if (!mounted) return;
        setCourse(courseRes.data);
        setEnrolled(Boolean(statusRes.data?.enrolled));
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || 'Failed to load purchase page');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [subjectId]);

  async function enrollNow() {
    if (buying) return;
    setBuying(true);
    setError('');
    try {
      await apiClient.post(`/enrollments/${subjectId}`);
      setEnrolled(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Enrollment failed');
    } finally {
      setBuying(false);
    }
  }

  if (loading) return <p>Loading purchase details...</p>;
  if (!course) return <p>{error || 'Course not found'}</p>;

  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-line bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Purchase Course</h1>
      <p className="mt-2 text-sm text-slate-600">Complete your enrollment to start learning this course.</p>

      <div className="mt-5 overflow-hidden rounded border border-line">
        <img
          src={course.thumbnail_url || 'https://placehold.co/640x360/e2e8f0/64748b?text=Course'}
          alt={`${course.title} thumbnail`}
          className="h-52 w-full object-cover"
        />
        <div className="p-4">
          <h2 className="text-lg font-semibold">{course.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{course.description}</p>
          <p className="mt-2 text-sm text-slate-600">Instructor: {course.instructor_name || 'TBA'}</p>
          <p className="mt-3 text-base font-semibold">Amount: Rs. {Number(course.price_amount || 0).toFixed(2)}</p>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {enrolled ? (
          <>
            <span className="rounded bg-green-100 px-3 py-1 text-sm text-green-800">Enrolled successfully</span>
            <button
              type="button"
              className="rounded bg-accent px-4 py-2 text-sm text-white"
              onClick={() => navigate(`/courses/${subjectId}`)}
            >
              Go to course
            </button>
          </>
        ) : (
          <button
            type="button"
            className="rounded bg-accent px-4 py-2 text-sm text-white disabled:opacity-60"
            disabled={buying}
            onClick={enrollNow}
          >
            {buying ? 'Processing...' : 'Enroll now'}
          </button>
        )}

        <Link to="/courses" className="text-sm text-accent">Back to courses</Link>
      </div>
    </section>
  );
}
