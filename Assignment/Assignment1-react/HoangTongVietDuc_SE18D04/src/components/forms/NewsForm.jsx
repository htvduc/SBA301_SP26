import "../../styles/Form.css";

function NewsForm({
  formData,
  onChange,
  errors = {},
  categories = [],
  tags = [],
  accounts = [],
  isStaff = false,
  currentUserId = null,
  isCreateMode = false,
}) {
  const selectedTagIds = formData.tagIDs || [];

  const handleTagToggle = (tagID) => {
    const newTagIDs = selectedTagIds.includes(tagID)
      ? selectedTagIds.filter((id) => id !== tagID)
      : [...selectedTagIds, tagID];
    
    // Update formData directly through onChange
    const syntheticEvent = {
      target: {
        name: "tagIDs",
        value: newTagIDs,
        type: "checkbox"
      }
    };
    onChange(syntheticEvent);
  };

  return (
    <div className="form-container">
      <div className="form-group">
        <label htmlFor="newsTitle">Tiêu đề *</label>
        <input
          type="text"
          id="newsTitle"
          name="newsTitle"
          value={formData.newsTitle || ""}
          onChange={onChange}
          className={errors.newsTitle ? "error" : ""}
          placeholder="Nhập tiêu đề bài viết"
        />
        {errors.newsTitle && (
          <span className="error-message">{errors.newsTitle}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="headline">Headline *</label>
        <input
          type="text"
          id="headline"
          name="headline"
          value={formData.headline || ""}
          onChange={onChange}
          className={errors.headline ? "error" : ""}
          placeholder="Nhập headline"
        />
        {errors.headline && (
          <span className="error-message">{errors.headline}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="newsContent">Nội dung *</label>
        <textarea
          id="newsContent"
          name="newsContent"
          value={formData.newsContent || ""}
          onChange={onChange}
          className={errors.newsContent ? "error" : ""}
          placeholder="Nhập nội dung bài viết"
          rows="6"
        />
        {errors.newsContent && (
          <span className="error-message">{errors.newsContent}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="categoryID">Danh mục *</label>
          <select
            id="categoryID"
            name="categoryID"
            value={formData.categoryID || ""}
            onChange={onChange}
            className={errors.categoryID ? "error" : ""}
          >
            <option value="">Chọn danh mục</option>
            {categories
              .filter((cat) => cat.isActive === true)
              .map((cat) => (
                <option key={cat.categoryID} value={cat.categoryID}>
                  {cat.categoryName}
                </option>
              ))}
          </select>
          {errors.categoryID && (
            <span className="error-message">{errors.categoryID}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="newsSource">Nguồn</label>
          <input
            type="text"
            id="newsSource"
            name="newsSource"
            value={formData.newsSource || ""}
            onChange={onChange}
            placeholder="Nhập nguồn tin"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="createdByID">Người tạo *</label>
          <select
            id="createdByID"
            name="createdByID"
            value={formData.createdByID || (isStaff && isCreateMode ? currentUserId : "")}
            onChange={onChange}
            className={errors.createdByID ? "error" : ""}
            disabled={isStaff && isCreateMode}
          >
            <option value="">Chọn người tạo</option>
            {accounts.map((acc) => (
              <option key={acc.accountID} value={acc.accountID}>
                {acc.accountName}
              </option>
            ))}
          </select>
          {isStaff && isCreateMode && (
            <span className="info-message">Bạn sẽ là người tạo bài viết này</span>
          )}
          {errors.createdByID && (
            <span className="error-message">{errors.createdByID}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="newsStatus">Trạng thái *</label>
          <select
            id="newsStatus"
            name="newsStatus"
            value={formData.newsStatus !== undefined ? formData.newsStatus : ""}
            onChange={onChange}
            className={errors.newsStatus ? "error" : ""}
          >
            <option value="">Chọn trạng thái</option>
            <option value="1">Published</option>
            <option value="0">Draft</option>
          </select>
          {errors.newsStatus && (
            <span className="error-message">{errors.newsStatus}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Tags</label>
        <div className="tags-container">
          {tags.map((tag) => (
            <label key={tag.tagID} className="tag-checkbox">
              <input
                type="checkbox"
                checked={selectedTagIds.includes(tag.tagID)}
                onChange={() => handleTagToggle(tag.tagID)}
              />
              <span>{tag.tagName}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewsForm;
