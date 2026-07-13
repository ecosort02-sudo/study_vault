import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success('Login successful!');
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="noise-bg"></div>
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/10 via-transparent to-[#7c3aed]/10"></div>
      
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#7c3aed] mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Student Portal</h1>
            <p className="text-[#a1a1aa]">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="login-email-input"
                className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff] focus:border-transparent transition-all"
                placeholder="student@portal.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="login-password-input"
                className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff] focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full py-3 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md hover:shadow-lg hover:shadow-[#00f0ff]/30 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-[#09090b] border border-[#27272a] rounded-md">
            <p className="text-xs text-[#a1a1aa] mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Test Credentials
            </p>
            <div className="text-xs space-y-1 text-[#a1a1aa]">
              <p>Admin: admin@portal.com / admin123</p>
              <p>Student: student@portal.com / student123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
