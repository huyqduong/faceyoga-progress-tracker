import React, { useState } from 'react';
import { Dumbbell, BookOpen } from 'lucide-react';
import ExerciseManager from './Admin/ExerciseManager';
import CourseManager from './Admin/CourseManager';

type Tab = 'exercises' | 'courses';

function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('exercises');

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">
          Manage your exercises and courses
        </p>
      </header>

      <div className="flex justify-center space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('exercises')}
          className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors
            ${activeTab === 'exercises'
              ? 'border-mint-500 text-mint-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          <Dumbbell className="w-5 h-5 mr-2" />
          Exercises
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors
            ${activeTab === 'courses'
              ? 'border-mint-500 text-mint-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Courses
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {activeTab === 'exercises' ? <ExerciseManager /> : <CourseManager />}
      </div>
    </div>
  );
}

export default Admin;