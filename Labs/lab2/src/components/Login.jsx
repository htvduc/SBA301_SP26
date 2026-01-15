import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username không được để trống";
    }

    if (!password.trim()) {
      newErrors.password = "Password không được để trống";
    } else if (password.length < 6) {
      newErrors.password = "Password phải ít nhất 6 ký tự";
    }

    setErrors(newErrors);

    // Nếu không có lỗi
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // ✅ Check tài khoản cứng
    if (username === "admin" && password === "123456") {
      localStorage.setItem("auth", "true");
      if (onLogin) onLogin(true);
      navigate("/", { replace: true });
    } else {
      setErrors({
        password: "Sai username hoặc password",
      });
    }
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
    setErrors({});
  };

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h3 className="mb-3">Login</h3>

      <form onSubmit={handleLogin} noValidate>
        {/* ===== USERNAME ===== */}
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className={`form-control ${errors.username ? "is-invalid" : ""}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && (
            <div className="invalid-feedback">{errors.username}</div>
          )}
        </div>

        {/* ===== PASSWORD ===== */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <div className="invalid-feedback">{errors.password}</div>
          )}
        </div>

        {/* ===== BUTTONS ===== */}
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
