/**
 * Client Routes
 * @ref-impl/client - Route definitions for client module
 */

import { Route, Routes } from 'react-router-dom';

/**
 * Client module routes
 * Handles: /dashboard/* (client), /jobs/*, /bookings/*
 */
export function ClientRoutes() {
  return (
    <Routes>
      {/* Client routes will be added during migration */}
      <Route path="/post-job/*" element={<div>Post job placeholder</div>} />
      <Route path="/my-jobs/*" element={<div>My jobs placeholder</div>} />
      <Route path="/bookings/*" element={<div>Bookings placeholder</div>} />
    </Routes>
  );
}
