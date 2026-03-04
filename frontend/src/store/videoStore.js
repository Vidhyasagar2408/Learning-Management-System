import { create } from 'zustand';

export const useVideoStore = create((set) => ({
  currentVideoId: null,
  subjectId: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isCompleted: false,
  nextVideoId: null,
  prevVideoId: null,
  setVideoMeta: (payload) => set((state) => ({ ...state, ...payload })),
  setTime: (currentTime) => set((state) => ({ ...state, currentTime })),
  setCompleted: (isCompleted) => set((state) => ({ ...state, isCompleted }))
}));