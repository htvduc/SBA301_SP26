import "../../styles/Form.css";

function ProfileForm({ formData, onChange, errors = {} }) {
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
        <label htmlFor="accountPassword">Mật khẩu mới</label>
        <input
          type="password"
          id="accountPassword"
          name="accountPassword"
          value={formData.accountPassword || ""}
          onChange={onChange}
          className={errors.accountPassword ? "error" : ""}
          placeholder="Để trống nếu không muốn đổi mật khẩu"
        />
        {errors.accountPassword && (
          <span className="error-message">{errors.accountPassword}</span>
        )}
      </div>
    </div>
  );
}

export default ProfileForm;
