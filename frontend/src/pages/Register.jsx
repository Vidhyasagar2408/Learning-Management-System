import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../lib/auth';
import Button from '../components/common/Button';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await registerUser({ name, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-2xl font-semibold">Create account</h1>
      <p className="mb-5 text-sm text-slate-500">Enter your details to start learning.</p>
      <form className="space-y-4" onSubmit={submit}>
        <fieldset className="space-y-3 rounded-lg border border-line bg-slate-50 p-4">
          <legend className="px-1 text-sm font-medium text-slate-700">Your details</legend>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Full name</span>
            <input
              className="w-full rounded-md border border-line bg-white p-2.5 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vidhyasagar"
              autoComplete="name"
              required
            />
          </label>
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
              placeholder="Minimum 8 characters"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
        </fieldset>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit">Create account</Button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <Link className="text-accent" to="/login">Login</Link></p>
    </div>
  );
}
