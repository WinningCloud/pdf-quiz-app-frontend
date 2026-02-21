import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PrivateRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // If non-admin user hasn't completed profile and isn't already on the complete-profile page, redirect
  if (!user.is_admin && !user.profile_completed && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" />;
  }

  return <Outlet />;
};

export default PrivateRoute;