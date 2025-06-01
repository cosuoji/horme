// src/store/useBlogStore.js
import { create } from 'zustand';

const useBlogStore = create((set) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true, error: null });

    try {
      const res = await fetch('/api/posts'); // Replace with your real API
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      set({ posts: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));

export default useBlogStore;
