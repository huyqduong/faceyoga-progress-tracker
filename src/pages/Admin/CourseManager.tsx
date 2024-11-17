import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import { useExerciseStore } from '../../store/exerciseStore';
import type { Course, CourseSection, Exercise } from '../../lib/supabase-types';
import CourseSectionManager from './CourseSectionManager';

function CourseManager() {
  const { courses, loading, error, fetchCourses, createCourse, updateCourse, deleteCourse } = useCourseStore();
  const { exercises, fetchExercises } = useExerciseStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    duration: '',
    image_url: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchExercises();
  }, [fetchCourses, fetchExercises]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const course = await createCourse(formData);
      setSelectedCourse(course);
      setExpandedCourse(course.id);
      setIsEditing(false);
      setFormData({
        title: '',
        description: '',
        difficulty: 'Beginner',
        duration: '',
        image_url: ''
      });
    } catch (err) {
      console.error('Error creating course:', err);
    }
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      duration: course.duration,
      image_url: course.image_url || ''
    });
    setIsEditing(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      await updateCourse(selectedCourse.id, formData);
      setIsEditing(false);
      setSelectedCourse(null);
      setFormData({
        title: '',
        description: '',
        difficulty: 'Beginner',
        duration: '',
        image_url: ''
      });
    } catch (err) {
      console.error('Error updating course:', err);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(id);
      if (expandedCourse === id) {
        setExpandedCourse(null);
      }
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Course Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
        >
          <Plus className="w-5 h-5 inline-block mr-2" />
          New Course
        </button>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={selectedCourse ? handleUpdateCourse : handleCreateCourse} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                  placeholder="e.g., 4 weeks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="https://..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedCourse(null);
                  setFormData({
                    title: '',
                    description: '',
                    difficulty: 'Beginner',
                    duration: '',
                    image_url: ''
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
              >
                <Save className="w-5 h-5 inline-block mr-2" />
                {selectedCourse ? 'Update Course' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {course.image_url && (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-gray-600 mt-1">{course.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{course.difficulty}</span>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="p-2 text-mint-600 hover:text-mint-700"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleCourseExpansion(course.id)}
                      className="p-2 text-gray-600 hover:text-gray-700"
                    >
                      {expandedCourse === course.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedCourse === course.id && (
                  <div className="mt-6 border-t pt-6">
                    <CourseSectionManager courseId={course.id} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseManager;