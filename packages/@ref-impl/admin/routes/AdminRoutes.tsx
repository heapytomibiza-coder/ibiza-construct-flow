/**
 * Admin Routes
 * @ref-impl/admin - Route definitions for admin module
 */

import { Route, Routes } from 'react-router-dom';

/**
 * Admin module routes
 * Handles: /admin/*
 */
export function AdminRoutes() {
  return (
    <Routes>
      {/* Admin routes will be added during migration */}
      <Route path="/admin/*" element={<div>Admin placeholder</div>} />
    </Routes>
  );
}
