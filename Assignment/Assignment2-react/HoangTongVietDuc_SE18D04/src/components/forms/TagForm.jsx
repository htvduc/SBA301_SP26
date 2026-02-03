import "../../styles/Form.css";

function TagForm({ formData, onChange, errors = {} }) {
  return (
    <div className="form-container">
      <div className="form-group">
        <label htmlFor="tagName">Tên tag *</label>
        <input
          type="text"
          id="tagName"
          name="tagName"
          value={formData.tagName || ""}
          onChange={onChange}
          className={errors.tagName ? "error" : ""}
          placeholder="Nhập tên tag"
        />
        {errors.tagName && (
          <span className="error-message">{errors.tagName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="note">Ghi chú</label>
        <textarea
          id="note"
          name="note"
          value={formData.note || ""}
          onChange={onChange}
          className={errors.note ? "error" : ""}
          placeholder="Nhập ghi chú cho tag"
          rows="4"
        />
        {errors.note && (
          <span className="error-message">{errors.note}</span>
        )}
      </div>
    </div>
  );
}

export default TagForm;
