import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Sparkles, Shield, TrendingUp, ArrowRight, Lock } from 'lucide-react';
import { toast } from 'sonner';
import Logo from '../components/Logo';

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
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] relative overflow-hidden">
      <div className="noise-bg"></div>

      {/* Animated background orbs */}
      <div className="orb orb-cyan"></div>
      <div className="orb orb-purple"></div>
      <div className="grid-pattern absolute inset-0 opacity-40"></div>

      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-24 h-24 border border-[#00f0ff]/20 rotate-12 rounded-2xl backdrop-blur-sm animate-in" style={{ animationDelay: '0.3s' }}></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 border border-[#7c3aed]/20 -rotate-12 rounded-full backdrop-blur-sm animate-in" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-[#00ff66]/20 rotate-45 backdrop-blur-sm animate-in hidden lg:block" style={{ animationDelay: '0.7s' }}></div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {/* Left panel - Brand story */}
        <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative">
          <div className="animate-in">
            <Logo size="md" />
          </div>

          <div className="space-y-8 animate-in stagger-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/5 text-xs font-mono uppercase tracking-wider text-[#00f0ff] mb-6">
                <Sparkles className="w-3 h-3" />
                Elite Learning Vault
              </div>
              <h1 className="font-display text-5xl xl:text-6xl font-bold tracking-tight leading-[1.05]">
                Ace every test.
                <br />
                <span className="text-gradient">Track every mark.</span>
              </h1>
              <p className="text-[#a1a1aa] mt-6 max-w-md text-lg">
                A hackerproof student portal built for focus, fairness, and forward-momentum. Tests, assignments, grades — all in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-w-md">
              {[
                { icon: Shield, label: 'Anti-cheat & inspect-element prevention', color: '#00ff66' },
                { icon: TrendingUp, label: 'Real-time rank & percentile analytics', color: '#00f0ff' },
                { icon: Lock, label: 'One-attempt integrity for every test', color: '#7c3aed' },
              ].map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div
                    key={idx}
                    className={`animate-in stagger-${idx + 3} flex items-center gap-3 p-3 rounded-xl border border-[#27272a] bg-[#18181b]/60 backdrop-blur-md`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: f.color }} />
                    </div>
                    <span className="text-sm text-[#e4e4e7]">{f.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="animate-in stagger-6 flex items-center gap-6 text-xs text-[#a1a1aa] font-mono uppercase tracking-wider">
            <span>Secure by design</span>
            <span className="w-1 h-1 rounded-full bg-[#27272a]"></span>
            <span>Supabase powered</span>
          </div>
        </div>

        {/* Right panel - Sign in */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md animate-in stagger-3">
            <div className="lg:hidden mb-8 flex justify-center">
              <Logo size="md" />
            </div>

            <div className="relative">
              {/* Card glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] rounded-3xl blur-xl opacity-20"></div>

              <div className="relative bg-[#18181b] border border-[#27272a] rounded-3xl p-8 md:p-10 backdrop-blur-xl">
                <div className="mb-8">
                  <h2 className="font-display text-3xl font-bold tracking-tight mb-2">
                    Welcome <span className="text-gradient">back</span>
                  </h2>
                  <p className="text-sm text-[#a1a1aa]">Sign in to continue your learning journey.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium mb-2 text-[#a1a1aa] uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="login-email-input"
                      className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white focus:outline-none focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/20 transition-all"
                      placeholder="you@studyvault.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-medium mb-2 text-[#a1a1aa] uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      data-testid="login-password-input"
                      className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white focus:outline-none focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/20 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="login-submit-button"
                    className="group w-full py-3.5 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-xl hover:shadow-[0_10px_40px_rgba(0,240,255,0.35)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Enter StudyVault
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
                  <p className="text-xs text-[#a1a1aa] mb-2 flex items-center gap-2 uppercase tracking-wider font-mono">
                    <AlertCircle className="w-3 h-3" />
                    Demo Credentials
                  </p>
                  <div className="text-xs space-y-1 text-[#e4e4e7]">
                    <p><span className="text-[#7c3aed] font-mono">admin</span> — admin@portal.com / admin123</p>
                    <p><span className="text-[#00f0ff] font-mono">student</span> — student@portal.com / student123</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
