import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
// 👇 1. BẮT BUỘC PHẢI CÓ DÒNG NÀY THÌ MỚI HIỆN THÔNG BÁO ĐẸP
import 'react-toastify/dist/ReactToastify.css'; 

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./stores/AuthContext";
// 👇 2. Import Component chứa khung thông báo
import { ToastContainer } from "react-toastify";

import MainLayout from "./components/MainLayout";
import About from "./components/About";
import Contact from "./components/Contact";
import ListOrchid from "./components/ListOrchid";
import Login from "./pages/Login";
import OrchidDetail from "./components/OrchidDetail";
import Dashboard from "./components/Dashboard";
import OrchidForm from "./components/OrchidForm";

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

            {/* CÁC ROUTE CRUD MỚI */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="add" element={<OrchidForm />} />
            <Route path="edit/:id" element={<OrchidForm />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* 👇 3. ĐẶT TOAST CONTAINER Ở ĐÂY ĐỂ NÓ HIỆN ĐƯỢC TRÊN TẤT CẢ CÁC TRANG */}
      <ToastContainer position="top-right" autoClose={3000} />
      
    </AuthProvider>
  );
}

export default App;