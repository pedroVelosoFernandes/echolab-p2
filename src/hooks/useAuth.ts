import { useState, useEffect } from 'react';
import { getCurrentUser, signOut as amplifySignOut, AuthUser } from 'aws-amplify/auth';
import { useNavigate } from 'react-router';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      await amplifySignOut();
      setUser(null);
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return { user, loading, signOut, checkUser };
}
