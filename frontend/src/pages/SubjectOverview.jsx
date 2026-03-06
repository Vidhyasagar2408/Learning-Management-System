import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../lib/apiClient';

export default function SubjectOverview() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await apiClient.get(`/subjects/${subjectId}/first-video`);
        if (!mounted) return;
        const videoId = res.data.video_id;
        if (videoId) {
          navigate(`/courses/${subjectId}/video/${videoId}`, { replace: true });
          return;
        }
        setError('No videos available in this course yet.');
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || 'Unable to open this course right now.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    return () => {
      mounted = false;
    };
  }, [subjectId, navigate]);

  if (loading) return <p>Loading first available video...</p>;
  return (
    <div className="rounded border border-line bg-white p-4 text-sm">
      <p>{error}</p>
      <Link to="/courses" className="mt-2 inline-block text-accent">Back to courses</Link>
    </div>
  );
}
