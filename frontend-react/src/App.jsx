import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { ChatPage } from './pages/ChatPage';

import { AuthProvider } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';

import { Dashboard } from './pages/Dashboard';

import { FieldDetails } from './pages/FieldDetails';
import { FloatingChatButton } from './components/FloatingChatButton';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/field/:id" element={<FieldDetails />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/login" element={<AuthPage />} />
        </Routes>
        <FloatingChatButton />
      </Router>
    </AuthProvider>
  );
}

export default App;
