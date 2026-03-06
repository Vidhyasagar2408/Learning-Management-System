import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SubjectOverview from './pages/SubjectOverview';
import VideoPage from './pages/VideoPage';
import Profile from './pages/Profile';
import PurchasePage from './pages/PurchasePage';
import ChatbotPage from './pages/ChatbotPage';
import AuthGuard from './components/Auth/AuthGuard';
import AppShell from './components/Layout/AppShell';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/courses" replace />} />
      <Route path="/courses" element={<AppShell><Home /></AppShell>} />
      <Route path="/subjects" element={<Navigate to="/courses" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/courses/:subjectId"
        element={<AuthGuard><AppShell><SubjectOverview /></AppShell></AuthGuard>}
      />
      <Route
        path="/courses/:subjectId/video/:videoId"
        element={<AuthGuard><AppShell><VideoPage /></AppShell></AuthGuard>}
      />
      <Route
        path="/courses/:subjectId/purchase"
        element={<AuthGuard><AppShell><PurchasePage /></AppShell></AuthGuard>}
      />
      <Route path="/profile" element={<AuthGuard><AppShell><Profile /></AppShell></AuthGuard>} />
      <Route path="/chatbot" element={<AuthGuard><AppShell><ChatbotPage /></AppShell></AuthGuard>} />
      <Route path="*" element={<Navigate to="/courses" replace />} />
    </Routes>
  );
}
