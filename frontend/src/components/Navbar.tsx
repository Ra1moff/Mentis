import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Swords, Menu, X, LogIn, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, token, login, register, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Math Battle', path: '/battle' },
    { name: 'Mental Arithmetic', path: '/mental' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Profile', path: '/profile' },
  ];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setAuthLoading(true);
    try {
      if (isRegister) {
        await register(username, email, password);
      } else {
        await login(email, password); // emailOrUsername is mapped to email state
      }
      setAuthModalOpen(false);
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 glass-panel border-b border-game-blue border-opacity-20 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-wider text-game-light select-none">
          <Swords className="text-game-lightBlue w-7 h-7 animate-pulse-slow" />
          <span className="bg-gradient-to-r from-game-light to-game-lightBlue bg-clip-text text-transparent">MATH</span>
          <span className="text-game-lightBlue text-xl font-medium">BATTLE</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`hover:text-game-lightBlue transition-all duration-200 py-1 border-b-2 ${
                isActive(link.path)
                  ? 'text-game-lightBlue border-game-lightBlue'
                  : 'text-game-light border-transparent'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop User Status */}
        <div className="hidden md:flex items-center gap-4">
          {token && user ? (
            <div className="flex items-center gap-4 bg-game-navy bg-opacity-60 px-4 py-2 rounded-lg border border-game-blue border-opacity-30">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-game-light">{user.username}</span>
                <span className="text-xs text-game-lightBlue font-medium">Lvl {user.level} (XP {user.xp})</span>
              </div>
              <button
                onClick={logout}
                className="hover:text-game-red transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right mr-1">
                <span className="text-xs text-game-lightBlue flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-game-orange" /> Guest Mode
                </span>
                <span className="text-xs text-game-light opacity-60">XP not synced</span>
              </div>
              <button
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg('');
                  setAuthModalOpen(true);
                }}
                className="game-btn-primary py-2 px-4 text-sm flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-game-light hover:text-game-lightBlue focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-35 bg-game-dark bg-opacity-95 backdrop-blur-lg flex flex-col pt-24 px-8 gap-6 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-xl font-semibold py-2 border-b border-game-blue border-opacity-20 ${
                isActive(link.path) ? 'text-game-lightBlue' : 'text-game-light'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-8 pt-6 border-t border-game-blue border-opacity-20 flex justify-between items-center">
            {token && user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="font-semibold text-game-light text-lg">{user.username}</span>
                  <span className="text-xs text-game-lightBlue font-medium">Level {user.level} • XP {user.xp}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="game-btn-secondary py-2 px-4 text-sm flex items-center gap-1 text-game-red border-game-red border-opacity-40"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-game-lightBlue flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-game-orange" /> Guest Mode
                </span>
                <button
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMsg('');
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="game-btn-primary py-2 px-4 text-sm"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal Overlay */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-game-dark bg-opacity-80 backdrop-blur-md p-4">
          <div className="w-full max-w-md glass-panel-heavy p-8 rounded-2xl relative animate-scale-up">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-game-lightBlue hover:text-game-light focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold text-center text-game-light tracking-wide mb-6">
              {isRegister ? 'Join the Battle Arena' : 'Enter the Arena'}
            </h3>

            {errorMsg && (
              <div className="bg-game-red bg-opacity-20 border border-game-red border-opacity-50 text-game-light text-sm px-4 py-2.5 rounded-lg mb-4 text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              {isRegister && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-game-lightBlue font-semibold uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="PlayerName"
                    className="glass-input text-sm py-2.5"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-game-lightBlue font-semibold uppercase tracking-wider">
                  {isRegister ? 'Email Address' : 'Email or Username'}
                </label>
                <input
                  type={isRegister ? 'email' : 'text'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRegister ? 'you@email.com' : 'Email or Username'}
                  className="glass-input text-sm py-2.5"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-game-lightBlue font-semibold uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input text-sm py-2.5"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="game-btn-primary py-3 font-semibold mt-4 text-sm tracking-wide disabled:opacity-50"
              >
                {authLoading ? 'Authorizing...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-game-light opacity-60">
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg('');
                }}
                className="text-game-lightBlue font-semibold hover:underline"
              >
                {isRegister ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
