import { create } from 'zustand';
import { courseApi } from '../lib/courses';
import type { Course, CourseSection, SectionExercise } from '../lib/supabase-types';

interface CourseState {
  courses: Course[];
  sections: Record<string, CourseSection[]>;
  exercises: Record<string, SectionExercise[]>;
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourseSections: (courseId: string) => Promise<void>;
  fetchSectionExercises: (sectionId: string) => Promise<void>;
  createCourse: (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => Promise<Course>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<Course>;
  deleteCourse: (id: string) => Promise<void>;
  createSection: (section: Omit<CourseSection, 'id' | 'created_at' | 'updated_at'>) => Promise<CourseSection>;
  updateSection: (id: string, section: Partial<CourseSection>) => Promise<CourseSection>;
  deleteSection: (id: string) => Promise<void>;
  addExerciseToSection: (sectionId: string, exerciseId: string, orderIndex: number) => Promise<void>;
  removeExerciseFromSection: (sectionId: string, exerciseId: string) => Promise<void>;
  reorderSectionExercises: (sectionId: string, exerciseIds: string[]) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  sections: {},
  exercises: {},
  loading: false,
  error: null,

  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const courses = await courseApi.fetchCourses();
      set({ courses, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch courses';
      set({ error: message, loading: false });
    }
  },

  fetchCourseSections: async (courseId: string) => {
    if (!courseId) {
      set({ error: 'Course ID is required' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const sections = await courseApi.fetchCourseSections(courseId);
      set((state) => ({
        sections: { ...state.sections, [courseId]: sections },
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch course sections';
      set({ error: message, loading: false });
    }
  },

  fetchSectionExercises: async (sectionId: string) => {
    if (!sectionId) {
      set({ error: 'Section ID is required' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const exercises = await courseApi.fetchSectionExercises(sectionId);
      set((state) => ({
        exercises: { ...state.exercises, [sectionId]: exercises },
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch section exercises';
      set({ error: message, loading: false });
    }
  },

  createCourse: async (course) => {
    set({ loading: true, error: null });
    try {
      const newCourse = await courseApi.createCourse(course);
      set((state) => ({
        courses: [newCourse, ...state.courses],
        loading: false
      }));
      return newCourse;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create course';
      set({ error: message, loading: false });
      throw error;
    }
  },

  updateCourse: async (id, course) => {
    set({ loading: true, error: null });
    try {
      const updatedCourse = await courseApi.updateCourse(id, course);
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? updatedCourse : c)),
        loading: false
      }));
      return updatedCourse;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update course';
      set({ error: message, loading: false });
      throw error;
    }
  },

  deleteCourse: async (id) => {
    set({ loading: true, error: null });
    try {
      await courseApi.deleteCourse(id);
      set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
        sections: { ...state.sections, [id]: [] },
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete course';
      set({ error: message, loading: false });
      throw error;
    }
  },

  createSection: async (section) => {
    set({ loading: true, error: null });
    try {
      const newSection = await courseApi.createSection(section);
      set((state) => ({
        sections: {
          ...state.sections,
          [section.course_id]: [
            ...(state.sections[section.course_id] || []),
            newSection
          ]
        },
        loading: false
      }));
      return newSection;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create section';
      set({ error: message, loading: false });
      throw error;
    }
  },

  updateSection: async (id, section) => {
    set({ loading: true, error: null });
    try {
      const updatedSection = await courseApi.updateSection(id, section);
      set((state) => ({
        sections: Object.fromEntries(
          Object.entries(state.sections).map(([courseId, sections]) => [
            courseId,
            sections.map((s) => (s.id === id ? updatedSection : s))
          ])
        ),
        loading: false
      }));
      return updatedSection;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update section';
      set({ error: message, loading: false });
      throw error;
    }
  },

  deleteSection: async (id) => {
    set({ loading: true, error: null });
    try {
      await courseApi.deleteSection(id);
      set((state) => ({
        sections: Object.fromEntries(
          Object.entries(state.sections).map(([courseId, sections]) => [
            courseId,
            sections.filter((s) => s.id !== id)
          ])
        ),
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete section';
      set({ error: message, loading: false });
      throw error;
    }
  },

  addExerciseToSection: async (sectionId, exerciseId, orderIndex) => {
    set({ loading: true, error: null });
    try {
      await courseApi.addExerciseToSection(sectionId, exerciseId, orderIndex);
      await get().fetchSectionExercises(sectionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add exercise to section';
      set({ error: message, loading: false });
      throw error;
    }
  },

  removeExerciseFromSection: async (sectionId, exerciseId) => {
    set({ loading: true, error: null });
    try {
      await courseApi.removeExerciseFromSection(sectionId, exerciseId);
      await get().fetchSectionExercises(sectionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove exercise from section';
      set({ error: message, loading: false });
      throw error;
    }
  },

  reorderSectionExercises: async (sectionId, exerciseIds) => {
    set({ loading: true, error: null });
    try {
      await courseApi.reorderSectionExercises(sectionId, exerciseIds);
      await get().fetchSectionExercises(sectionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reorder exercises';
      set({ error: message, loading: false });
      throw error;
    }
  }
}));