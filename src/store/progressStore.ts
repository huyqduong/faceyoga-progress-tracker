import { create } from 'zustand';
import { supabaseApi } from '../lib/supabase';
import type { Progress } from '../lib/supabase-types';

interface ProgressState {
  entries: Progress[];
  loading: boolean;
  error: Error | null;
  fetchProgress: (userId: string) => Promise<void>;
  addProgress: (userId: string, imageFile: File, notes: string) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set) => ({
  entries: [],
  loading: false,
  error: null,

  fetchProgress: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const progress = await supabaseApi.getUserProgress(userId);
      set({ entries: progress, loading: false });
    } catch (error) {
      console.error('Error fetching progress:', error);
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch progress'), 
        loading: false 
      });
    }
  },

  addProgress: async (userId: string, imageFile: File, notes: string) => {
    set({ loading: true, error: null });
    try {
      // First upload the image
      const imageUrl = await supabaseApi.uploadProgressImage(userId, imageFile);

      // Then create the progress entry
      const progress = await supabaseApi.createProgressEntry(userId, imageUrl, notes);

      // Update the local state
      set((state) => ({
        entries: [progress, ...state.entries],
        loading: false
      }));
    } catch (error) {
      console.error('Error adding progress:', error);
      set({ 
        error: error instanceof Error ? error : new Error('Failed to save progress'), 
        loading: false 
      });
      throw error;
    }
  }
}));