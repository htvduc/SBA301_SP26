import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Header from "./components/Header";
import Footer from "./components/Footer";
import About from "./components/About";
import Contact from "./components/Contact";
import ListOrchid from "./components/ListOrchid";
import Login from "./components/Login";
import OrchidDetail from "./components/OrchidDetail";

// ✅ PHẢI ĐỂ NGOÀI App
function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem("auth") === "true";
    } catch {
      return false;
    }
  });

  return (
    <Router>

      {/* Ẩn header/footer nếu chưa login */}
      {isAuthenticated && (
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onLogout={() => {
            localStorage.removeItem("auth");
            setIsAuthenticated(false);
          }}
        />
      )}


      <main style={{ minHeight: "70vh" }} className="mt-4">
        <Routes>

          {/* Login page */}
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

          {/* Home */}
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ListOrchid searchTerm={searchTerm} onSearchChange={setSearchTerm} />
              </ProtectedRoute>
            }
          />

          {/* About */}
          <Route
            path="/about"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <About />
              </ProtectedRoute>
            }
          />

          {/* Contact */}
          <Route
            path="/contact"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Contact />
              </ProtectedRoute>
            }
          />

          {/* Detail */}
          <Route
            path="/orchid/:id"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <OrchidDetail />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>

      {isAuthenticated && (
        <Footer
          avatar="/images/avatar.jpg"
          name="DucHTV"
          email="hoangtongvietduc@gmail.com"
        />
      )}
    </Router>
  );
}

export default App;
