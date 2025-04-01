import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

interface PasswordProtectionProps {
  onAuthenticated: () => void;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('kai_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      onAuthenticated();
    }
  }, [onAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace 'your-secure-password' with your desired password
    if (password === 'your-secure-password') {
      setIsAuthenticated(true);
      localStorage.setItem('kai_auth', 'true');
      onAuthenticated();
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-zinc-800">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
            <Lock size={24} className="text-white" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-center mb-2">Welcome to Kai</h2>
        <p className="text-zinc-400 text-center mb-6">Please enter your password to continue</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`w-full bg-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 ${
                error ? 'ring-red-500' : 'focus:ring-orange-500'
              }`}
              placeholder="Enter password"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">Incorrect password</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 text-sm transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordProtection; 