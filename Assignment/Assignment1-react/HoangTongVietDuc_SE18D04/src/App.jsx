import "./App.css";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import useAuth from "./stores/useAuth";

import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";


// Route bảo vệ sử dụng Context
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  // Nếu chưa login, đá về trang login
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Nếu đã login, cho phép render các route con bên trong
  return <Outlet />; 
}

// Placeholder components - bạn có thể thay thế sau
function MainLayout() {
  return <Outlet />;
}

function ListOrchid() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Danh sách Orchid</h1>
      <p>Trang này đang được phát triển...</p>
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      <p>Trang này đang được phát triển...</p>
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        {/* Route công khai */}
        <Route path="/login" element={<LoginPage />} />

        {/* Cụm Route bảo vệ dùng chung Layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route element={<MainLayout />}>
            <Route index element={<ListOrchid />} />
            <Route path="dashboard" element={<Dashboard />} />
            {/* Thêm các route khác của bạn vào đây */}
            {/* <Route path="about" element={<About />} /> */}
            {/* <Route path="contact" element={<Contact />} /> */}
          </Route>
        </Route>

        {/* Mặc định về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Thông báo */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;