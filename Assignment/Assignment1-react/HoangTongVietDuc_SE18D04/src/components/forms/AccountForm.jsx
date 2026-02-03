import "../../styles/Form.css";

function AccountForm({ formData, onChange, errors = {} }) {
  return (
    <div className="form-container">
      <div className="form-group">
        <label htmlFor="accountName">Tên tài khoản *</label>
        <input
          type="text"
          id="accountName"
          name="accountName"
          value={formData.accountName || ""}
          onChange={onChange}
          className={errors.accountName ? "error" : ""}
          placeholder="Nhập tên tài khoản"
        />
        {errors.accountName && (
          <span className="error-message">{errors.accountName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="accountEmail">Email *</label>
        <input
          type="email"
          id="accountEmail"
          name="accountEmail"
          value={formData.accountEmail || ""}
          onChange={onChange}
          className={errors.accountEmail ? "error" : ""}
          placeholder="example@fun.edu.vn"
        />
        {errors.accountEmail && (
          <span className="error-message">{errors.accountEmail}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="accountPassword">Mật khẩu *</label>
        <input
          type="password"
          id="accountPassword"
          name="accountPassword"
          value={formData.accountPassword || ""}
          onChange={onChange}
          className={errors.accountPassword ? "error" : ""}
          placeholder="Nhập mật khẩu"
        />
        {errors.accountPassword && (
          <span className="error-message">{errors.accountPassword}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="accountRole">Vai trò *</label>
        <select
          id="accountRole"
          name="accountRole"
          value={formData.accountRole || ""}
          onChange={onChange}
          className={errors.accountRole ? "error" : ""}
        >
          <option value="">Chọn vai trò</option>
          <option value="1">Admin</option>
          <option value="2">Staff</option>
        </select>
        {errors.accountRole && (
          <span className="error-message">{errors.accountRole}</span>
        )}
      </div>
    </div>
  );
}

export default AccountForm;
