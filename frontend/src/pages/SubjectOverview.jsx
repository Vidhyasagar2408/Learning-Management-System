import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../lib/apiClient';

export default function SubjectOverview() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    apiClient.get(`/subjects/${subjectId}/first-video`).then((res) => {
      if (!mounted) return;
      const videoId = res.data.video_id;
      if (videoId) {
        navigate(`/courses/${subjectId}/video/${videoId}`, { replace: true });
      }
    });
    return () => {
      mounted = false;
    };
  }, [subjectId, navigate]);

  return <p>Loading first available video...</p>;
}
