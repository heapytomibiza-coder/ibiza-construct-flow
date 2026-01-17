/**
 * Workers Routes
 * @ref-impl/workers - Route definitions for workers module
 */

import { Route, Routes } from 'react-router-dom';

/**
 * Workers module routes
 * Handles: /pro/* (professional dashboard, job board, portfolio, etc.)
 */
export function WorkerRoutes() {
  return (
    <Routes>
      {/* Worker routes will be added during migration */}
      <Route path="/pro/dashboard/*" element={<div>Pro dashboard placeholder</div>} />
      <Route path="/pro/jobs/*" element={<div>Job board placeholder</div>} />
      <Route path="/pro/portfolio/*" element={<div>Portfolio placeholder</div>} />
      <Route path="/pro/availability/*" element={<div>Availability placeholder</div>} />
      <Route path="/pro/earnings/*" element={<div>Earnings placeholder</div>} />
    </Routes>
  );
}
