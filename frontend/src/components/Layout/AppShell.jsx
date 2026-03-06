import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logoutUser } from '../../lib/auth';

export default function AppShell({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/courses" className="text-lg font-semibold">Kodnest LMS</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/courses" className={location.pathname === '/courses' ? 'text-accent' : ''}>Home</Link>
            <Link to="/courses" className={location.pathname.startsWith('/courses/') ? 'text-accent' : ''}>Courses</Link>
            {isAuthenticated && <Link to="/profile" className={location.pathname === '/profile' ? 'text-accent' : ''}>Profile</Link>}
            {isAuthenticated && <Link to="/chatbot" className={location.pathname === '/chatbot' ? 'text-accent' : ''}>Chatbot</Link>}
            {isAuthenticated ? (
              <button onClick={logoutUser} className="rounded border border-line px-3 py-1">Logout</button>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
            {isAuthenticated && <span className="text-xs text-slate-500">{user?.email}</span>}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
