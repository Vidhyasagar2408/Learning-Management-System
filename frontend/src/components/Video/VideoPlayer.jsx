import { useEffect, useMemo, useRef } from 'react';
import YouTube from 'react-youtube';
import { createProgressSender } from '../../lib/progress';

function parseYoutubeSource(input) {
  if (!input) return { videoId: '', playlistId: '' };
  const short = input.match(/youtu\.be\/([^?&/]+)/);
  if (short) return { videoId: short[1], playlistId: '' };
  const long = input.match(/[?&]v=([^?&/]+)/);
  const list = input.match(/[?&]list=([^?&/]+)/);
  if (long) return { videoId: long[1], playlistId: list?.[1] || '' };
  if (list) return { videoId: '', playlistId: list[1] };
  return { videoId: input, playlistId: '' };
}

export default function VideoPlayer({ videoId, youtubeUrl, startPositionSeconds, onProgress, onCompleted }) {
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const completedRef = useRef(false);

  const progressSender = useMemo(() => createProgressSender(onProgress, 5000), [onProgress]);

  const source = parseYoutubeSource(youtubeUrl);

  const stopProgressLoop = async ({ persistPosition = true } = {}) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (persistPosition && !completedRef.current && playerRef.current?.getCurrentTime) {
      const current = Math.floor(playerRef.current.getCurrentTime() || 0);
      await progressSender.flush();
      await onProgress({ last_position_seconds: current, is_completed: false });
    }
  };

  useEffect(() => {
    completedRef.current = false;
    return () => {
      void stopProgressLoop();
    };
  }, [videoId]);

  if (!source.videoId && !source.playlistId) {
    return <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">Video unavailable</div>;
  }

  const playerVars = { start: Math.floor(startPositionSeconds || 0) };
  if (source.playlistId && !source.videoId) {
    playerVars.listType = 'playlist';
    playerVars.list = source.playlistId;
  }

  return (
    <div className="overflow-hidden rounded border border-line bg-white">
      <YouTube
        videoId={source.videoId || undefined}
        opts={{
          width: '100%',
          height: '450',
          playerVars
        }}
        onReady={(event) => {
          playerRef.current = event.target;
        }}
        onStateChange={async (event) => {
          const playerState = event.data;

          if (playerState === 1) {
            if (!intervalRef.current) {
              intervalRef.current = setInterval(async () => {
                if (completedRef.current) return;
                const current = Math.floor(event.target.getCurrentTime() || 0);
                progressSender.push({
                  last_position_seconds: current,
                  is_completed: false
                });
              }, 5000);
            }
          }

          if (playerState === 2) {
            await stopProgressLoop();
          }

          if (playerState === 0) {
            completedRef.current = true;
            await stopProgressLoop({ persistPosition: false });
            await onCompleted(videoId);
          }
        }}
      />
    </div>
  );
}
