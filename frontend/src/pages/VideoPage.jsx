import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubjectSidebar from '../components/Sidebar/SubjectSidebar';
import VideoPlayer from '../components/Video/VideoPlayer';
import VideoMeta from '../components/Video/VideoMeta';
import Alert from '../components/common/Alert';
import apiClient from '../lib/apiClient';
import { useSidebarStore } from '../store/sidebarStore';

export default function VideoPage() {
  const { subjectId, videoId } = useParams();
  const navigate = useNavigate();
  const { tree, setTree, setLoading, loading, setError, markVideoCompleted } = useSidebarStore();

  const [video, setVideo] = useState(null);
  const [resume, setResume] = useState({ last_position_seconds: 0, is_completed: false });
  const [error, setLocalError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setLocalError('');
      try {
        const [treeRes, videoRes] = await Promise.all([
          apiClient.get(`/subjects/${subjectId}/tree`),
          apiClient.get(`/videos/${videoId}`)
        ]);

        if (!mounted) return;
        setTree(treeRes.data);
        setVideo(videoRes.data);

        if (!videoRes.data.locked) {
          const progressRes = await apiClient.get(`/progress/videos/${videoId}`);
          if (mounted) setResume(progressRes.data);
        }
      } catch (err) {
        const msg = err?.response?.data?.message || 'Could not load video';
        if (mounted) {
          setLocalError(msg);
          setError(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [subjectId, videoId, setTree, setLoading, setError]);

  async function sendProgress(payload) {
    await apiClient.post(`/progress/videos/${videoId}`, payload);
  }

  async function handleCompleted() {
    await apiClient.post(`/progress/videos/${videoId}`, {
      last_position_seconds: Number(video?.duration_seconds || 0),
      is_completed: true
    });

    markVideoCompleted(videoId);

    if (video?.next_video_id) {
      navigate(`/courses/${subjectId}/video/${video.next_video_id}`);
      return;
    }

    setLocalError('Subject completed. Great work.');
  }

  if (loading || !video) {
    return <p>Loading video...</p>;
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <SubjectSidebar subjectId={subjectId} tree={tree} currentVideoId={videoId} />
      <div className="min-w-0 flex-1 space-y-4">
        {error ? <Alert>{error}</Alert> : null}

        {video.locked ? (
          <Alert>Complete previous video to unlock this one.</Alert>
        ) : (
          <VideoPlayer
            videoId={videoId}
            youtubeUrl={video.youtube_url}
            startPositionSeconds={resume.last_position_seconds}
            onProgress={sendProgress}
            onCompleted={handleCompleted}
          />
        )}

        <VideoMeta title={video.title} description={video.description} />
      </div>
    </div>
  );
}
