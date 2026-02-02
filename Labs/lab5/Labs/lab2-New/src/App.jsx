import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./stores/AuthContext";
import MainLayout from "./components/MainLayout";

import About from "./components/About";
import Contact from "./components/Contact";
import ListOrchid from "./components/ListOrchid";
import Login from "./pages/Login";
import OrchidDetail from "./components/OrchidDetail";

// Route bảo vệ
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("auth") === "true";
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Layout với các route con bảo vệ */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Home */}
            <Route index element={<ListOrchid />} />

            {/* About */}
            <Route path="about" element={<About />} />

            {/* Contact */}
            <Route path="contact" element={<Contact />} />

            {/* Detail */}
            <Route path="orchid/:id" element={<OrchidDetail />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;