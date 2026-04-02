import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { signUp, confirmSignUp, signIn, getCurrentUser } from 'aws-amplify/auth';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkIfAlreadySignedIn();
  }, []);

  async function checkIfAlreadySignedIn() {
    try {
      await getCurrentUser();
      navigate('/app');
    } catch {
      // Not signed in, stay on page
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      setNeedsConfirmation(true);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmSignUp({ username: email, confirmationCode });
      await signIn({ username: email, password });
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to confirm sign up');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {needsConfirmation ? 'Confirm your email' : 'Create an account'}
          </h1>
          <p className="text-sm text-gray-400">
            {needsConfirmation ? (
              'We sent a confirmation code to your email'
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/signin" className="text-[#5e6ad2] font-medium hover:text-[#4e5ac2]">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        <div className="bg-[#111] border border-[#222] rounded-lg p-8">
          {!needsConfirmation ? (
            <form onSubmit={handleSignUp} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-950/50 border border-red-800 rounded-md text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#333] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] placeholder-gray-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#333] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] placeholder-gray-500"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Must be at least 8 characters with uppercase, lowercase, numbers, and symbols
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-[#5e6ad2] text-white rounded-md hover:bg-[#4e5ac2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmSignUp} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-950/50 border border-red-800 rounded-md text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-white mb-2">
                  Confirmation Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#333] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] placeholder-gray-500"
                  placeholder="123456"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-[#5e6ad2] text-white rounded-md hover:bg-[#4e5ac2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Confirming...' : 'Confirm'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}