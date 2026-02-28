import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { ChatPage } from './pages/ChatPage';

import { AuthProvider } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';

import { Dashboard } from './pages/Dashboard';
import { WelcomePage } from './pages/WelcomePage';
import { WeatherPage } from './pages/WeatherPage';

import { FieldDetails } from './pages/FieldDetails';
import { FloatingChatButton } from './components/FloatingChatButton';
import { ProtectedRoute } from './components/ProtectedRoute';

const HIDE_CHAT_ROUTES = ['/weather', '/welcome', '/', '/login'];

function AppContent() {
  const location = useLocation();
  const showChat = !HIDE_CHAT_ROUTES.includes(location.pathname);

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Protected routes — require authentication */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/field/:id" element={<ProtectedRoute><FieldDetails /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
      </Routes>
      {showChat && <FloatingChatButton />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
