import { useNavigate } from "react-router-dom";
import useAuth from "../stores/useAuth";
import "../styles/Header.css";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="admin-user-info">
          <div className="user-avatar">
            <span>{user?.accountName?.charAt(0) || "A"}</span>
          </div>
          <div className="user-details">
            <span className="user-name">{user?.accountName || "Admin"}</span>
            <span className="user-email">{user?.accountEmail || ""}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <span className="logout-icon">🚪</span>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
