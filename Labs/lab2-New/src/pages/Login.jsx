import { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import loginReducer from  "../stores/loginReducer";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [state, dispatch] = useReducer(loginReducer, {
    isLoading: false,
    isAuthenticated: false,
    user: null,
    error: null,
  });

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

    // Dispatch LOGIN_REQUEST action
    dispatch({ type: "LOGIN_REQUEST" });

    // Simulate API call with setTimeout
    setTimeout(() => {
      // ✅ Check tài khoản cứng
      if (username === "admin" && password === "123456") {
        localStorage.setItem("auth", "true");
        const user = { username, role: "admin" };
        
        // Dispatch LOGIN_SUCCESS action
        dispatch({ type: "LOGIN_SUCCESS", payload: user });
        
        if (onLogin) onLogin(true);
        navigate("/", { replace: true });
      } else {
        // Dispatch LOGIN_FAILURE action
        dispatch({
          type: "LOGIN_FAILURE",
          payload: "Sai username hoặc password",
        });
        setErrors({
          password: "Sai username hoặc password",
        });
      }
    }, 500);
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
    setErrors({});
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <h1>Orchid Store</h1>
            <p>Đăng nhập vào tài khoản của bạn</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} noValidate className="login-form">
            {/* Username */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                className={`form-control ${errors.username ? "error" : ""}`}
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && (
                <span className="error-text">{errors.username}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                className={`form-control ${errors.password ? "error" : ""}`}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {/* Demo Info */}
            {/* <div className="demo-box">
              <strong>Tài khoản demo:</strong>
              <p>Username: <code>admin</code></p>
              <p>Password: <code>123456</code></p>
            </div> */}

            {/* Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn-submit"
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={state.isLoading}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
