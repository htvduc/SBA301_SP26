import useLogin from "../hooks/useLogin";
import "./Login.css";

function Login({ onLogin }) {
  const {
    formState,
    isLoading,
    error,
    handleChange,
    handleSubmit,
    handleReset,
  } = useLogin(onLogin);

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
          <form onSubmit={handleSubmit} noValidate className="login-form">
            {error && (
              <div className="alert-error">
                <strong>Lỗi:</strong> {error}
              </div>
            )}

            {/* Identifier */}
            <div className="form-group">
              <label htmlFor="identifier" className="form-label">
                Tên đăng nhập hoặc Email
              </label>
              <input
                id="identifier"
                type="text"
                name="identifier"
                className={`form-control ${
                  formState.errors.identifier ? "error" : ""
                }`}
                placeholder="Nhập tên đăng nhập hoặc email"
                value={formState.identifier}
                onChange={handleChange}
                disabled={isLoading}
              />
              {formState.errors.identifier && (
                <span className="error-text">
                  {formState.errors.identifier}
                </span>
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
                name="password"
                className={`form-control ${
                  formState.errors.password ? "error" : ""
                }`}
                placeholder="Nhập mật khẩu"
                value={formState.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              {formState.errors.password && (
                <span className="error-text">
                  {formState.errors.password}
                </span>
              )}
            </div>

            {/* Demo Info */}
            <div className="demo-box">
              <strong>Tài khoản demo:</strong>
              <p>
                Admin: <code>admin</code> / <code>123456</code>
              </p>
              <p>
                User: <code>user1</code> / <code>123456</code> (bị từ chối)
              </p>
              <p>
                Locked: <code>user2</code> / <code>123456</code> (bị khóa)
              </p>
            </div>

            {/* Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn-submit"
                disabled={isLoading}
              >
                {isLoading ? (
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
                onClick={handleReset}
                disabled={isLoading}
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
