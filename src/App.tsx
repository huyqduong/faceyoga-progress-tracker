import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import Progress from './pages/Progress';
import Coaching from './pages/Coaching';
import Resources from './pages/Resources';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import AuthGuard from './components/AuthGuard';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-mint-50 pattern-bg flex flex-col">
        {user && <Navbar />}
        <main className={`flex-1 container mx-auto px-4 py-6 md:py-8 ${user ? 'mt-0' : 'mt-0'}`}>
          <Routes>
            <Route path="/login" element={
              user ? <Navigate to="/" replace /> : <Login />
            } />
            <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/exercises" element={<AuthGuard><Exercises /></AuthGuard>} />
            <Route path="/progress" element={<AuthGuard><Progress /></AuthGuard>} />
            <Route path="/coaching" element={<AuthGuard><Coaching /></AuthGuard>} />
            <Route path="/resources" element={<AuthGuard><Resources /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
            <Route path="/admin" element={<AuthGuard><Admin /></AuthGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;