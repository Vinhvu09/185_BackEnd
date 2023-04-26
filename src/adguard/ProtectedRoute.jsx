import React from 'react'

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute
