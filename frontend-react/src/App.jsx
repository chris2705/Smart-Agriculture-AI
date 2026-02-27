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

const HIDE_CHAT_ROUTES = ['/weather', '/welcome', '/', '/login'];

function AppContent() {
  const location = useLocation();
  const showChat = !HIDE_CHAT_ROUTES.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/field/:id" element={<FieldDetails />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/login" element={<AuthPage />} />
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
