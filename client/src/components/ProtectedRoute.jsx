import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Loading } from './UI.jsx';

export const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" />;

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (user) return <Navigate to="/app" />;

  return children;
};
