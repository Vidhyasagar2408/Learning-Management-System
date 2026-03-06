import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../lib/auth';
import Button from '../components/common/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await loginUser({ email, password });
      navigate(location.state?.from || '/courses', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold">Welcome back</h1>
        <p className="mb-5 text-sm text-slate-500">Enter your login details to continue.</p>
        <form className="space-y-4" onSubmit={submit}>
          <fieldset className="space-y-3 rounded-lg border border-line bg-slate-50 p-4">
            <legend className="px-1 text-sm font-medium text-slate-700">Login details</legend>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-700">Email address</span>
              <input
                className="w-full rounded-md border border-line bg-white p-2.5 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                type="email"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-700">Password</span>
              <input
                className="w-full rounded-md border border-line bg-white p-2.5 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
          </fieldset>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit">Sign in</Button>
        </form>
        <p className="mt-4 text-sm">No account? <Link className="text-accent" to="/register">Register</Link></p>
      </div>
    </div>
  );
}
