import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import MainLayout from "./components/MainLayout";

import About from "./components/About";
import Contact from "./components/Contact";
import ListOrchid from "./components/ListOrchid";
import Login from "./pages/Login";
import OrchidDetail from "./components/OrchidDetail";

// Route bảo vệ
function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem("auth") === "true";
    } catch {
      return false;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>

        {/* Layout */}
        <Route
          element={
            <MainLayout
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
            />
          }
        >

          {/* Home */}
          <Route
            index
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ListOrchid />
              </ProtectedRoute>
            }
          />

          {/* About */}
          <Route
            path="about"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <About />
              </ProtectedRoute>
            }
          />

          {/* Contact */}
          <Route
            path="contact"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Contact />
              </ProtectedRoute>
            }
          />

          {/* Detail */}
          <Route
            path="orchid/:id"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <OrchidDetail />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={() => setIsAuthenticated(true)} />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>

  );
}

export default App;
