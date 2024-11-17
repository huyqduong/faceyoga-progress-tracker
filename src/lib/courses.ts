import { supabase } from './supabase';
import type { Course, CourseSection, SectionExercise } from './supabase-types';

export const courseApi = {
  async fetchCourses(): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  },

  async fetchCourseSections(courseId: string): Promise<CourseSection[]> {
    try {
      if (!courseId) throw new Error('Course ID is required');

      const { data, error } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching course sections:', error);
      throw new Error('Failed to fetch course sections');
    }
  },

  async fetchSectionExercises(sectionId: string): Promise<SectionExercise[]> {
    try {
      if (!sectionId) throw new Error('Section ID is required');

      const { data, error } = await supabase
        .from('section_exercises')
        .select(`
          *,
          exercise:exercises (*)
        `)
        .eq('section_id', sectionId)
        .order('order_index');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching section exercises:', error);
      throw new Error('Failed to fetch section exercises');
    }
  },

  async createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...course,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw new Error('Failed to create course');
    }
  },

  async updateCourse(id: string, course: Partial<Course>): Promise<Course> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({
          ...course,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw new Error('Failed to update course');
    }
  },

  async deleteCourse(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw new Error('Failed to delete course');
    }
  },

  async createSection(section: Omit<CourseSection, 'id' | 'created_at' | 'updated_at'>): Promise<CourseSection> {
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .insert({
          ...section,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating section:', error);
      throw new Error('Failed to create section');
    }
  },

  async updateSection(id: string, section: Partial<CourseSection>): Promise<CourseSection> {
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .update({
          ...section,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating section:', error);
      throw new Error('Failed to update section');
    }
  },

  async deleteSection(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting section:', error);
      throw new Error('Failed to delete section');
    }
  },

  async addExerciseToSection(sectionId: string, exerciseId: string, orderIndex: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('section_exercises')
        .insert({
          section_id: sectionId,
          exercise_id: exerciseId,
          order_index: orderIndex,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding exercise to section:', error);
      throw new Error('Failed to add exercise to section');
    }
  },

  async removeExerciseFromSection(sectionId: string, exerciseId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('section_exercises')
        .delete()
        .eq('section_id', sectionId)
        .eq('exercise_id', exerciseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing exercise from section:', error);
      throw new Error('Failed to remove exercise from section');
    }
  },

  async reorderSectionExercises(sectionId: string, exerciseIds: string[]): Promise<void> {
    try {
      const updates = exerciseIds.map((exerciseId, index) => ({
        section_id: sectionId,
        exercise_id: exerciseId,
        order_index: index
      }));

      const { error } = await supabase
        .from('section_exercises')
        .upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error('Error reordering exercises:', error);
      throw new Error('Failed to reorder exercises');
    }
  }
};