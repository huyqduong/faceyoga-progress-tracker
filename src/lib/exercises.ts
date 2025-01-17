import { supabase } from './supabase';
import type { Exercise } from './supabase-types';

export const exerciseApi = {
  async getExercises(): Promise<Exercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw new Error('Failed to fetch exercises');
    }
  },

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching exercises by category:', error);
      throw new Error('Failed to fetch exercises');
    }
  },

  async createExercise(exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>): Promise<Exercise> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          ...exercise,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw new Error('Failed to create exercise');
    }
  },

  async updateExercise(id: string, exercise: Partial<Exercise>): Promise<Exercise> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update({
          ...exercise,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw new Error('Failed to update exercise');
    }
  },

  async deleteExercise(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw new Error('Failed to delete exercise');
    }
  }
};