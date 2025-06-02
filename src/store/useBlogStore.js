// src/store/useBlogStore.js
import { create } from 'zustand';
import axios from "../lib/axios";
import { toast } from "react-hot-toast";


const useBlogStore = create((set) => ({
  postsList: [],
  loading: false,
  error: null,
  currentPost: null,

  fetchPosts: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get('/posts'); // Note: Added /api prefix
      set({ 
        postsList: response.data, // Axios stores data in .data property
        loading: false 
      });
      return response.data; // Optional: Return data for component use
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch posts';
      set({ 
        error: errorMessage,
        loading: false 
      });
      throw error; // Re-throw for component-level handling
    }
  },
  createNewPost: async (postData)=>{
    set({ loading: true, error: null });

    try {
      const response = await axios.post('posts', {
        title: postData.title,
        category: postData.category,
        excerpt: postData.excerpt,
        content: postData.content,
        coverImage: postData.coverImage // If you have images
      });

          // Update state optimistically
      set((state) => ({
            postsList: [response.data, ...state.postsList],
            loading: false,
            currentPost: response.data // If you want to track the newly created post
          }));

          toast.success('Post created successfully!');
        }
          catch (error) {
            console.error('Post creation failed:', error);
            
            set({ 
              error: error.response?.data?.message || 'Failed to create post',
              loading: false 
            });
      
            toast.error(error.response?.data?.message || 'Post creation failed');
            throw error; // Re-throw for component-level handling
          }
  },
  deletePost: async (postId)=>{
    set({ loading: true, error: null });
    
    try {
      const response = await axios.delete('/posts', {data: { postId }});

      set((state) => ({
        postsList: state.postsList.filter((post) => post._id !== postId),
        loading: false,
      }));

          toast.success('Post deleted successfully!');
        }
          catch (error) {
            console.error('Post deletion failed:', error);
            
            set({ 
              error: error.response?.data?.message || 'Failed to delete post',
              loading: false 
            });
      
            toast.error(error.response?.data?.message || 'Post deletion failed');
            throw error; // Re-throw for component-level handling
          }
  }
}));

export default useBlogStore;

