import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
  tree: null,
  loading: false,
  error: null,
  setTree: (tree) => set({ tree, loading: false, error: null }),
  setLoading: (loading) => set((state) => ({ ...state, loading })),
  setError: (error) => set({ error, loading: false }),
  markVideoCompleted: (videoId) =>
    set((state) => {
      if (!state.tree) return state;
      const flat = [];
      for (const section of state.tree.sections) {
        for (const video of section.videos) {
          flat.push({ sectionId: section.id, id: video.id });
        }
      }

      const currentIndex = flat.findIndex((v) => Number(v.id) === Number(videoId));
      const nextId = currentIndex >= 0 && currentIndex + 1 < flat.length ? flat[currentIndex + 1].id : null;

      const nextSections = state.tree.sections.map((section) => {
        const videos = section.videos.map((video) => {
          if (Number(video.id) === Number(videoId)) {
            return { ...video, is_completed: true };
          }
          if (nextId && Number(video.id) === Number(nextId)) {
            return { ...video, locked: false };
          }
          return video;
        });
        return { ...section, videos };
      });
      return { ...state, tree: { ...state.tree, sections: nextSections } };
    })
}));
