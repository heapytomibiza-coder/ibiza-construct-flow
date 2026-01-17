/**
 * User Routes
 * @ref-impl/user - Route definitions for user module
 */

import { Route, Routes } from 'react-router-dom';

/**
 * User module routes
 * Handles: /auth/*, /settings/*, /profile/*
 */
export function UserRoutes() {
  return (
    <Routes>
      {/* Auth routes will be added during migration */}
      <Route path="/auth/*" element={<div>Auth placeholder</div>} />
      <Route path="/settings/*" element={<div>Settings placeholder</div>} />
      <Route path="/profile/*" element={<div>Profile placeholder</div>} />
    </Routes>
  );
}
