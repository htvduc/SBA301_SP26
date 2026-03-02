import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import StaffCustomersPage from './pages/StaffCustomersPage';
import StaffRoomsPage from './pages/StaffRoomsPage';
import StaffBookingsPage from './pages/StaffBookingsPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CustomerBookingsPage from './pages/CustomerBookingsPage';
import CustomerNewBookingPage from './pages/CustomerNewBookingPage';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Staff routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute roles={['STAFF']}>
                <StaffDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/customers"
            element={
              <ProtectedRoute roles={['STAFF']}>
                <StaffCustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/rooms"
            element={
              <ProtectedRoute roles={['STAFF']}>
                <StaffRoomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/bookings"
            element={
              <ProtectedRoute roles={['STAFF']}>
                <StaffBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Customer routes */}
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute roles={['CUSTOMER']}>
                <CustomerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <ProtectedRoute roles={['CUSTOMER']}>
                <CustomerBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings/new"
            element={
              <ProtectedRoute roles={['CUSTOMER']}>
                <CustomerNewBookingPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;