import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Target, Trophy, Clock, Play, MessageCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useExerciseStore } from '../store/exerciseStore';

function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { exercises } = useExerciseStore();

  const formatPracticeTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} mins`;
    }
    return `${Math.round(hours * 10) / 10} hrs`;
  };

  const stats = [
    { 
      icon: Calendar, 
      title: 'Daily Streak', 
      value: `${profile?.streak || 0} days`,
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      icon: Trophy, 
      title: 'Exercises Done', 
      value: profile?.exercises_done?.toString() || '0',
      color: 'bg-green-100 text-green-600'
    },
    { 
      icon: Clock, 
      title: 'Practice Time', 
      value: formatPracticeTime(profile?.practice_time || 0),
      color: 'bg-purple-100 text-purple-600'
    },
    { 
      icon: Target, 
      title: 'Available Exercises', 
      value: exercises.length.toString(),
      color: 'bg-mint-100 text-mint-600'
    },
  ];

  // Get 3 random exercises for today's suggested routine
  const suggestedExercises = exercises
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const handleStartExercise = (exerciseId: string) => {
    navigate(`/exercises?start=${exerciseId}`);
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ' Back'}!
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track your progress, follow personalized routines, and achieve your facial fitness goals.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ icon: Icon, title, value, color }) => (
          <div key={title} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Today's Suggested Routine</h2>
            <button 
              onClick={() => navigate('/exercises')}
              className="text-mint-600 hover:text-mint-700 flex items-center text-sm font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {suggestedExercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <img
                    src={exercise.image_url}
                    alt={exercise.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{exercise.title}</h3>
                    <p className="text-sm text-gray-600">{exercise.duration}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartExercise(exercise.id)}
                  className="flex items-center space-x-1 px-4 py-2 bg-mint-500 text-white rounded-lg text-sm font-medium hover:bg-mint-600 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Coach Tips</h2>
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                "Remember to stay hydrated and maintain proper posture during your exercises. 
                Take deep breaths and perform each movement mindfully for maximum benefits."
              </p>
            </div>
            <button
              onClick={() => navigate('/coaching')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat with AI Coach</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;