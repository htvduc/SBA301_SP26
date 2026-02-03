import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import AccountForm from "../components/forms/AccountForm";
import CategoryForm from "../components/forms/CategoryForm";
import NewsForm from "../components/forms/NewsForm";
import TagForm from "../components/forms/TagForm";
import ProfileForm from "../components/forms/ProfileForm";
import useAuth from "../stores/useAuth";
import dbData from "../db.json";
// import { accountAPI, categoryAPI, newsAPI, tagAPI, profileAPI } from "../services/api";
import "../styles/AdminPage.css";

// TODO: Khi tích hợp API, thay thế các hàm CRUD hiện tại bằng API calls
// Ví dụ: 
// const handleSaveAccount = async () => {
//   try {
//     const token = localStorage.getItem('token');
//     if (modalMode === "create") {
//       await accountAPI.create(formData, token);
//     } else {
//       await accountAPI.update(currentItem.accountID, formData, token);
//     }
//     toast.success("Thành công!");
//   } catch (error) {
//     toast.error(error.message);
//   }
// };

function AdminPage() {
  const { user } = useAuth();
  const isAdmin = user?.accountRole === 1;
  const isStaff = user?.accountRole === 2;
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState({
    systemAccounts: [],
    categories: [],
    newsArticles: [],
    tags: [],
    newsTags: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [deleteCallback, setDeleteCallback] = useState(null);

  useEffect(() => {
    if (dbData) {
      setData({
        systemAccounts: dbData.systemAccounts || [],
        categories: dbData.categories || [],
        newsArticles: dbData.newsArticles || [],
        tags: dbData.tags || [],
        newsTags: dbData.newsTags || [],
      });
    }
  }, []);

  // Helper functions
  const getCategoryName = (categoryID) => {
    const category = data.categories.find((cat) => cat.categoryID === categoryID);
    return category ? category.categoryName : "Unknown";
  };

  const getAccountName = (accountID) => {
    const account = data.systemAccounts.find((acc) => acc.accountID === accountID);
    return account ? account.accountName : "Unknown";
  };

  const getNewsTags = (newsArticleID) => {
    const tags = data.newsTags
      .filter((nt) => nt.newsArticleID === newsArticleID)
      .map((nt) => {
        const tag = data.tags.find((t) => t.tagID === nt.tagID);
        return tag ? tag.tagName : "";
      })
      .filter((name) => name !== "");
    return tags.join(", ");
  };

  // Search filter
  const filterData = (items, searchFields) => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) =>
        String(item[field] || "").toLowerCase().includes(term)
      )
    );
  };

  // CRUD Operations for Accounts
  const handleCreateAccount = () => {
    setModalMode("create");
    setFormData({});
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEditAccount = (account) => {
    setModalMode("edit");
    setCurrentItem(account);
    setFormData({ ...account });
    setFormErrors({});
    setModalOpen(true);
  };

  // Check if account has created any news articles
  const hasAccountCreatedNews = (accountID) => {
    return data.newsArticles.some((article) => article.createdByID === accountID);
  };

  const handleDeleteAccount = (accountID) => {
    // Check if account has created any news articles
    if (hasAccountCreatedNews(accountID)) {
      toast.error("Không thể xóa tài khoản này. Tài khoản đã tạo tin tức.");
      return;
    }

    setDeleteCallback(() => () => {
      setData((prev) => ({
        ...prev,
        systemAccounts: prev.systemAccounts.filter(
          (acc) => acc.accountID !== accountID
        ),
      }));
      toast.success("Xóa tài khoản thành công!");
    });
    setConfirmOpen(true);
  };

  const validateAccount = () => {
    const errors = {};
    if (!formData.accountName?.trim()) errors.accountName = "Tên tài khoản là bắt buộc";
    if (!formData.accountEmail?.trim()) errors.accountEmail = "Email là bắt buộc";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.accountEmail))
      errors.accountEmail = "Email không hợp lệ";
    if (!formData.accountPassword?.trim()) errors.accountPassword = "Mật khẩu là bắt buộc";
    if (!formData.accountRole) errors.accountRole = "Vai trò là bắt buộc";
    return errors;
  };

  const handleSaveAccount = () => {
    const errors = validateAccount();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (modalMode === "create") {
      const newID = Math.max(...data.systemAccounts.map((a) => a.accountID), 0) + 1;
      const newAccount = {
        accountID: newID,
        ...formData,
        accountRole: parseInt(formData.accountRole),
      };
      setData((prev) => ({
        ...prev,
        systemAccounts: [...prev.systemAccounts, newAccount],
      }));
      toast.success("Thêm tài khoản thành công!");
    } else {
      setData((prev) => ({
        ...prev,
        systemAccounts: prev.systemAccounts.map((acc) =>
          acc.accountID === currentItem.accountID
            ? { ...formData, accountID: currentItem.accountID, accountRole: parseInt(formData.accountRole) }
            : acc
        ),
      }));
      toast.success("Cập nhật tài khoản thành công!");
    }
    setModalOpen(false);
    setFormData({});
    setFormErrors({});
  };

  // CRUD Operations for Categories
  const handleCreateCategory = () => {
    setModalMode("create");
    setFormData({ isActive: true });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setModalMode("edit");
    setCurrentItem(category);
    setFormData({ ...category });
    setFormErrors({});
    setModalOpen(true);
  };

  // Check if category is used in any news articles
  const isCategoryUsedInNews = (categoryID) => {
    return data.newsArticles.some((article) => article.categoryID === categoryID);
  };

  const handleDeleteCategory = (categoryID) => {
    // Check if category is used in any news articles
    if (isCategoryUsedInNews(categoryID)) {
      toast.error("Không thể xóa danh mục này. Danh mục đã được sử dụng trong tin tức.");
      return;
    }

    setDeleteCallback(() => () => {
      setData((prev) => ({
        ...prev,
        categories: prev.categories.filter((cat) => cat.categoryID !== categoryID),
      }));
      toast.success("Xóa danh mục thành công!");
    });
    setConfirmOpen(true);
  };

  const validateCategory = () => {
    const errors = {};
    if (!formData.categoryName?.trim()) errors.categoryName = "Tên danh mục là bắt buộc";
    return errors;
  };

  const handleSaveCategory = () => {
    const errors = validateCategory();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (modalMode === "create") {
      const newID = Math.max(...data.categories.map((c) => c.categoryID), 0) + 1;
      const newCategory = {
        categoryID: newID,
        categoryName: formData.categoryName,
        categoryDescription: formData.categoryDescription || "",
        parentCategoryID: formData.parentCategoryID ? parseInt(formData.parentCategoryID) : null,
        isActive: formData.isActive !== false,
      };
      setData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }));
      toast.success("Thêm danh mục thành công!");
    } else {
      setData((prev) => ({
        ...prev,
        categories: prev.categories.map((cat) =>
          cat.categoryID === currentItem.categoryID
            ? {
                ...cat,
                categoryName: formData.categoryName,
                categoryDescription: formData.categoryDescription || "",
                parentCategoryID: formData.parentCategoryID ? parseInt(formData.parentCategoryID) : null,
                isActive: formData.isActive !== false,
              }
            : cat
        ),
      }));
      toast.success("Cập nhật danh mục thành công!");
    }
    setModalOpen(false);
    setFormData({});
    setFormErrors({});
  };

  // CRUD Operations for News
  const handleCreateNews = () => {
    setModalMode("create");
    setFormData({ 
      newsStatus: 1, 
      tagIDs: [],
      createdByID: isStaff ? user?.id : undefined 
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEditNews = (article) => {
    setModalMode("edit");
    setCurrentItem(article);
    const tagIDs = data.newsTags
      .filter((nt) => nt.newsArticleID === article.newsArticleID)
      .map((nt) => nt.tagID);
    setFormData({ ...article, tagIDs });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleDeleteNews = (newsArticleID) => {
    setDeleteCallback(() => () => {
      setData((prev) => ({
        ...prev,
        newsArticles: prev.newsArticles.filter(
          (art) => art.newsArticleID !== newsArticleID
        ),
        newsTags: prev.newsTags.filter(
          (nt) => nt.newsArticleID !== newsArticleID
        ),
      }));
      toast.success("Xóa tin tức thành công!");
    });
    setConfirmOpen(true);
  };

  const validateNews = () => {
    const errors = {};
    if (!formData.newsTitle?.trim()) errors.newsTitle = "Tiêu đề là bắt buộc";
    if (!formData.headline?.trim()) errors.headline = "Headline là bắt buộc";
    if (!formData.newsContent?.trim()) errors.newsContent = "Nội dung là bắt buộc";
    if (!formData.categoryID) errors.categoryID = "Danh mục là bắt buộc";
    if (!formData.createdByID) errors.createdByID = "Người tạo là bắt buộc";
    if (formData.newsStatus === undefined || formData.newsStatus === "")
      errors.newsStatus = "Trạng thái là bắt buộc";
    return errors;
  };

  const handleSaveNews = () => {
    const errors = validateNews();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (modalMode === "create") {
      const newID = Math.max(...data.newsArticles.map((a) => a.newsArticleID), 0) + 1;
      // Staff can only create news as themselves
      const createdByID = isStaff ? user?.id : parseInt(formData.createdByID);
      const newArticle = {
        newsArticleID: newID,
        newsTitle: formData.newsTitle,
        headline: formData.headline,
        newsContent: formData.newsContent,
        newsSource: formData.newsSource || "FUNews",
        categoryID: parseInt(formData.categoryID),
        newsStatus: parseInt(formData.newsStatus),
        createdByID: createdByID,
        createdDate: new Date().toISOString(),
        updatedByID: null,
        modifiedDate: null,
      };
      setData((prev) => {
        const newNewsTags = (formData.tagIDs || []).map((tagID) => ({
          newsArticleID: newID,
          tagID: parseInt(tagID),
        }));
        return {
          ...prev,
          newsArticles: [...prev.newsArticles, newArticle],
          newsTags: [...prev.newsTags, ...newNewsTags],
        };
      });
      toast.success("Thêm tin tức thành công!");
    } else {
      setData((prev) => {
        const updatedArticle = {
          ...prev.newsArticles.find((a) => a.newsArticleID === currentItem.newsArticleID),
          newsTitle: formData.newsTitle,
          headline: formData.headline,
          newsContent: formData.newsContent,
          newsSource: formData.newsSource || "FUNews",
          categoryID: parseInt(formData.categoryID),
          newsStatus: parseInt(formData.newsStatus),
          updatedByID: currentItem.createdByID,
          modifiedDate: new Date().toISOString(),
        };
        const newNewsTags = (formData.tagIDs || []).map((tagID) => ({
          newsArticleID: currentItem.newsArticleID,
          tagID: parseInt(tagID),
        }));
        return {
          ...prev,
          newsArticles: prev.newsArticles.map((art) =>
            art.newsArticleID === currentItem.newsArticleID ? updatedArticle : art
          ),
          newsTags: [
            ...prev.newsTags.filter(
              (nt) => nt.newsArticleID !== currentItem.newsArticleID
            ),
            ...newNewsTags,
          ],
        };
      });
      toast.success("Cập nhật tin tức thành công!");
    }
    setModalOpen(false);
    setFormData({});
    setFormErrors({});
  };

  // CRUD Operations for Profile (Staff only)
  const handleSaveProfile = () => {
    const errors = {};
    if (!formData.accountName?.trim()) errors.accountName = "Tên tài khoản là bắt buộc";
    if (!formData.accountEmail?.trim()) errors.accountEmail = "Email là bắt buộc";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.accountEmail))
      errors.accountEmail = "Email không hợp lệ";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Only update if password is provided
    const updateData = {
      accountName: formData.accountName,
      accountEmail: formData.accountEmail,
    };
    
    if (formData.accountPassword?.trim()) {
      updateData.accountPassword = formData.accountPassword;
    }

    setData((prev) => ({
      ...prev,
      systemAccounts: prev.systemAccounts.map((acc) =>
        acc.accountID === user?.id
          ? { ...acc, ...updateData }
          : acc
      ),
    }));
    
    // Update user context
    const updatedUser = {
      ...user,
      accountName: formData.accountName,
      accountEmail: formData.accountEmail,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    toast.success("Cập nhật profile thành công!");
    setModalOpen(false);
    setFormData({});
    setFormErrors({});
  };

  // CRUD Operations for Tags
  const handleCreateTag = () => {
    setModalMode("create");
    setFormData({});
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEditTag = (tag) => {
    setModalMode("edit");
    setCurrentItem(tag);
    setFormData({ ...tag });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleDeleteTag = (tagID) => {
    setDeleteCallback(() => () => {
      setData((prev) => ({
        ...prev,
        tags: prev.tags.filter((tag) => tag.tagID !== tagID),
        newsTags: prev.newsTags.filter((nt) => nt.tagID !== tagID),
      }));
      toast.success("Xóa tag thành công!");
    });
    setConfirmOpen(true);
  };

  const validateTag = () => {
    const errors = {};
    if (!formData.tagName?.trim()) errors.tagName = "Tên tag là bắt buộc";
    return errors;
  };

  const handleSaveTag = () => {
    const errors = validateTag();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (modalMode === "create") {
      const newID = Math.max(...data.tags.map((t) => t.tagID), 0) + 1;
      const newTag = {
        tagID: newID,
        tagName: formData.tagName,
        note: formData.note || "",
      };
      setData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      toast.success("Thêm tag thành công!");
    } else {
      setData((prev) => ({
        ...prev,
        tags: prev.tags.map((tag) =>
          tag.tagID === currentItem.tagID
            ? {
                ...tag,
                tagName: formData.tagName,
                note: formData.note || "",
              }
            : tag
        ),
      }));
      toast.success("Cập nhật tag thành công!");
    }
    setModalOpen(false);
    setFormData({});
    setFormErrors({});
  };

  // Get filtered data based on active tab
  const getFilteredData = () => {
    switch (activeTab) {
      case "users":
        return filterData(data.systemAccounts, ["accountName", "accountEmail"]);
      case "category":
        return filterData(data.categories, ["categoryName", "categoryDescription"]);
      case "news":
        return filterData(data.newsArticles, ["newsTitle", "headline", "newsContent"]);
      case "tags":
        return filterData(data.tags, ["tagName", "note"]);
      default:
        return [];
    }
  };

  const filteredData = getFilteredData();

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="dashboard-tab">
            <div className="dashboard-header">
              <h2>📰 Danh sách Tin tức</h2>
              <p className="dashboard-subtitle">Tổng cộng {data.newsArticles.length} bài viết</p>
            </div>
            <div className="dashboard-news-list">
              {data.newsArticles.length === 0 ? (
                <div className="empty-state">
                  <p>Chưa có tin tức nào. Hãy thêm tin tức mới trong mục News!</p>
                </div>
              ) : (
                data.newsArticles.map((article) => (
                  <div key={article.newsArticleID} className="dashboard-news-item">
                    <div className="news-item-header">
                      <div className="news-header-left">
                        <h4 className="news-title">{article.newsTitle}</h4>
                        <div className="news-meta">
                          <span className="news-category">
                            📁 {getCategoryName(article.categoryID)}
                          </span>
                          <span className="news-date">
                            📅 {new Date(article.createdDate).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </span>
                          <span className={`news-status ${article.newsStatus === 1 ? "published" : "draft"}`}>
                            {article.newsStatus === 1 ? "✅ Đã xuất bản" : "📝 Bản nháp"}
                          </span>
                        </div>
                      </div>
                      <div className="news-actions">
                        <button
                          className="btn-edit-small"
                          onClick={() => {
                            setActiveTab("news");
                            setTimeout(() => handleEditNews(article), 100);
                          }}
                          title="Chuyển đến trang chỉnh sửa"
                        >
                          ✏️ Chỉnh sửa
                        </button>
                      </div>
                    </div>
                    <p className="news-headline">{article.headline}</p>
                    <div className="news-content">
                      {article.newsContent}
                    </div>
                    {getNewsTags(article.newsArticleID) && (
                      <div className="news-tags">
                        {getNewsTags(article.newsArticleID).split(", ").map((tag, index) => (
                          <span key={index} className="news-tag">🏷️ {tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "users":
        if (!isAdmin) {
          return (
            <div className="management-tab">
              <h2>Không có quyền truy cập</h2>
              <p>Chỉ Admin mới có thể quản lý tài khoản.</p>
            </div>
          );
        }
        return (
          <div className="management-tab users-tab">
            <div className="tab-header">
              <h2>Quản lý Tài khoản</h2>
              <button className="btn-primary" onClick={handleCreateAccount}>
                + Thêm mới
              </button>
            </div>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên tài khoản</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((account) => (
                    <tr key={account.accountID}>
                      <td>{account.accountID}</td>
                      <td>{account.accountName}</td>
                      <td>{account.accountEmail}</td>
                      <td>
                        <span className={`role-badge role-${account.accountRole === 1 ? "admin" : "staff"}`}>
                          {account.accountRole === 1 ? "Admin" : "Staff"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditAccount(account)}
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteAccount(account.accountID)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "category":
        if (!isStaff) {
          return (
            <div className="management-tab">
              <h2>Không có quyền truy cập</h2>
              <p>Chỉ Staff mới có thể quản lý danh mục.</p>
            </div>
          );
        }
        return (
          <div className="management-tab categories-tab">
            <div className="tab-header">
              <h2>Quản lý Danh mục</h2>
              <button className="btn-primary" onClick={handleCreateCategory}>
                + Thêm mới
              </button>
            </div>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên danh mục</th>
                    <th>Mô tả</th>
                    <th>Danh mục cha</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((category) => (
                    <tr key={category.categoryID}>
                      <td>{category.categoryID}</td>
                      <td>{category.categoryName}</td>
                      <td>{category.categoryDescription}</td>
                      <td>
                        {category.parentCategoryID
                          ? getCategoryName(category.parentCategoryID)
                          : "None"}
                      </td>
                      <td>
                        <span
                          className={
                            category.isActive ? "status-active" : "status-inactive"
                          }
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditCategory(category)}
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteCategory(category.categoryID)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "news":
        if (!isStaff) {
          return (
            <div className="management-tab">
              <h2>Không có quyền truy cập</h2>
              <p>Chỉ Staff mới có thể quản lý tin tức.</p>
            </div>
          );
        }
        return (
          <div className="management-tab news-tab">
            <div className="tab-header">
              <h2>Quản lý Tin tức</h2>
              <button className="btn-primary" onClick={handleCreateNews}>
                + Thêm mới
              </button>
            </div>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, headline hoặc nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Headline</th>
                    <th>Danh mục</th>
                    <th>Người tạo</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Tags</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((article) => (
                    <tr key={article.newsArticleID}>
                      <td>{article.newsArticleID}</td>
                      <td className="title-cell">{article.newsTitle}</td>
                      <td className="headline-cell">{article.headline}</td>
                      <td>{getCategoryName(article.categoryID)}</td>
                      <td>{getAccountName(article.createdByID)}</td>
                      <td>
                        {new Date(article.createdDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        <span
                          className={
                            article.newsStatus === 1
                              ? "status-active"
                              : "status-inactive"
                          }
                        >
                          {article.newsStatus === 1 ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>{getNewsTags(article.newsArticleID) || "None"}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditNews(article)}
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteNews(article.newsArticleID)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "tags":
        if (!isStaff) {
          return (
            <div className="management-tab">
              <h2>Không có quyền truy cập</h2>
              <p>Chỉ Staff mới có thể quản lý tags.</p>
            </div>
          );
        }
        return (
          <div className="management-tab tags-tab">
            <div className="tab-header">
              <h2>Quản lý Tags</h2>
              <button className="btn-primary" onClick={handleCreateTag}>
                + Thêm mới
              </button>
            </div>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Tag</th>
                    <th>Ghi chú</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((tag) => (
                    <tr key={tag.tagID}>
                      <td>{tag.tagID}</td>
                      <td>{tag.tagName}</td>
                      <td>{tag.note || "-"}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditTag(tag)}
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteTag(tag.tagID)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "profile":
        if (!isStaff) {
          return (
            <div className="management-tab">
              <h2>Không có quyền truy cập</h2>
              <p>Chỉ Staff mới có thể quản lý profile.</p>
            </div>
          );
        }
        return (
          <div className="management-tab profile-tab">
            <div className="tab-header">
              <h2>Quản lý Profile</h2>
              <button 
                className="btn-primary" 
                onClick={() => {
                  const currentAccount = data.systemAccounts.find(
                    (acc) => acc.accountID === user?.id
                  );
                  if (currentAccount) {
                    setModalMode("edit");
                    setCurrentItem(currentAccount);
                    setFormData({ ...currentAccount, accountPassword: "" });
                    setFormErrors({});
                    setModalOpen(true);
                  }
                }}
              >
                ✏️ Chỉnh sửa Profile
              </button>
            </div>
            <div className="profile-info">
              <div className="profile-card">
                <div className="profile-avatar">
                  <span>{user?.accountName?.charAt(0) || "S"}</span>
                </div>
                <div className="profile-details">
                  <h3>{user?.accountName || "Staff"}</h3>
                  <p className="profile-email">{user?.accountEmail || ""}</p>
                  <p className="profile-role">
                    <span className="role-badge role-staff">Staff</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "history":
        if (!isStaff) {
          return (
            <div className="management-tab">
              <h2>Không có quyền truy cập</h2>
              <p>Chỉ Staff mới có thể xem lịch sử tin tức.</p>
            </div>
          );
        }
        const staffNews = data.newsArticles.filter(
          (article) => article.createdByID === user?.id
        );
        const filteredStaffNews = filterData(staffNews, ["newsTitle", "headline", "newsContent"]);
        
        return (
          <div className="management-tab history-tab">
            <div className="tab-header">
              <h2>Lịch sử Tin tức của tôi</h2>
              <p className="history-subtitle">Tổng cộng {staffNews.length} bài viết</p>
            </div>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, headline hoặc nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Headline</th>
                    <th>Danh mục</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Tags</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaffNews.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
                        Chưa có tin tức nào được tạo bởi bạn.
                      </td>
                    </tr>
                  ) : (
                    filteredStaffNews.map((article) => (
                      <tr key={article.newsArticleID}>
                        <td>{article.newsArticleID}</td>
                        <td className="title-cell">{article.newsTitle}</td>
                        <td className="headline-cell">{article.headline}</td>
                        <td>{getCategoryName(article.categoryID)}</td>
                        <td>
                          {new Date(article.createdDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td>
                          <span
                            className={
                              article.newsStatus === 1
                                ? "status-active"
                                : "status-inactive"
                            }
                          >
                            {article.newsStatus === 1 ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td>{getNewsTags(article.newsArticleID) || "None"}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-edit"
                              onClick={() => handleEditNews(article)}
                              title="Sửa"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteNews(article.newsArticleID)}
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderModal = () => {
    if (!modalOpen) return null;

    let title = "";
    let formComponent = null;
    let onSave = null;

    if (activeTab === "users") {
      title = modalMode === "create" ? "Thêm tài khoản mới" : "Sửa tài khoản";
      formComponent = (
        <AccountForm
          formData={formData}
          onChange={(e) =>
            setFormData({ ...formData, [e.target.name]: e.target.value })
          }
          errors={formErrors}
        />
      );
      onSave = handleSaveAccount;
    } else if (activeTab === "category") {
      title = modalMode === "create" ? "Thêm danh mục mới" : "Sửa danh mục";
      formComponent = (
        <CategoryForm
          formData={formData}
          onChange={(e) => {
            const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
            setFormData({ ...formData, [e.target.name]: value });
          }}
          errors={formErrors}
          categories={data.categories}
        />
      );
      onSave = handleSaveCategory;
    } else if (activeTab === "news") {
      title = modalMode === "create" ? "Thêm tin tức mới" : "Sửa tin tức";
      formComponent = (
        <NewsForm
          formData={formData}
          onChange={(e) => {
            const name = e.target.name;
            let value;
            if (name === "tagIDs") {
              value = e.target.value; // This is already an array from handleTagToggle
            } else {
              value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
            }
            setFormData({ ...formData, [name]: value });
          }}
          errors={formErrors}
          categories={data.categories.filter((cat) => cat.isActive === true)}
          tags={data.tags}
          accounts={isStaff ? data.systemAccounts.filter((acc) => acc.accountID === user?.id) : data.systemAccounts}
          isStaff={isStaff}
          currentUserId={user?.id}
          isCreateMode={modalMode === "create"}
        />
      );
      onSave = handleSaveNews;
    } else if (activeTab === "tags") {
      title = modalMode === "create" ? "Thêm tag mới" : "Sửa tag";
      formComponent = (
        <TagForm
          formData={formData}
          onChange={(e) =>
            setFormData({ ...formData, [e.target.name]: e.target.value })
          }
          errors={formErrors}
        />
      );
      onSave = handleSaveTag;
    } else if (activeTab === "profile") {
      title = "Chỉnh sửa Profile";
      formComponent = (
        <ProfileForm
          formData={formData}
          onChange={(e) =>
            setFormData({ ...formData, [e.target.name]: e.target.value })
          }
          errors={formErrors}
        />
      );
      onSave = handleSaveProfile;
    }

    return (
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormData({});
          setFormErrors({});
        }}
        title={title}
        size={activeTab === "news" ? "large" : "medium"}
      >
        {formComponent}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>
            Hủy
          </button>
          <button className="btn-primary" onClick={onSave}>
            {modalMode === "create" ? "Tạo mới" : "Cập nhật"}
          </button>
        </div>
      </Modal>
    );
  };

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-container">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="admin-content">
          {renderContent()}
        </main>
      </div>
      {renderModal()}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (deleteCallback) {
            deleteCallback();
            setDeleteCallback(null);
          }
        }}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác."
        type="danger"
      />
    </div>
  );
}

export default AdminPage;
