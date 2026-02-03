import "../../styles/Form.css";

function CategoryForm({ formData, onChange, errors = {}, categories = [] }) {
  return (
    <div className="form-container">
      <div className="form-group">
        <label htmlFor="categoryName">Tên danh mục *</label>
        <input
          type="text"
          id="categoryName"
          name="categoryName"
          value={formData.categoryName || ""}
          onChange={onChange}
          className={errors.categoryName ? "error" : ""}
          placeholder="Nhập tên danh mục"
        />
        {errors.categoryName && (
          <span className="error-message">{errors.categoryName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="categoryDescription">Mô tả</label>
        <textarea
          id="categoryDescription"
          name="categoryDescription"
          value={formData.categoryDescription || ""}
          onChange={onChange}
          className={errors.categoryDescription ? "error" : ""}
          placeholder="Nhập mô tả danh mục"
          rows="4"
        />
        {errors.categoryDescription && (
          <span className="error-message">{errors.categoryDescription}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="parentCategoryID">Danh mục cha</label>
        <select
          id="parentCategoryID"
          name="parentCategoryID"
          value={formData.parentCategoryID || ""}
          onChange={onChange}
        >
          <option value="">Không có (Danh mục gốc)</option>
          {categories
            .filter((cat) => cat.categoryID !== formData.categoryID)
            .map((cat) => (
              <option key={cat.categoryID} value={cat.categoryID}>
                {cat.categoryName}
              </option>
            ))}
        </select>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive !== false}
            onChange={(e) =>
              onChange({
                target: { name: "isActive", value: e.target.checked },
              })
            }
          />
          <span>Kích hoạt</span>
        </label>
      </div>
    </div>
  );
}

export default CategoryForm;
