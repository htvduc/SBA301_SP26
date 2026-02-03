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
import { accountAPI, categoryAPI, newsAPI, tagAPI, profileAPI } from "../services/api";
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
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [deleteCallback, setDeleteCallback] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null); // Lưu ID và type của item cần xóa
  const [staffNews, setStaffNews] = useState([]); // For history tab

  // Load data từ API
  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Nếu có JWT, nếu không thì null
      
      // Load data theo role
      const [accounts, categories, news, tags] = await Promise.all([
        isAdmin ? accountAPI.getAll(token).catch(() => []) : Promise.resolve([]),
        categoryAPI.getAll(token).catch(() => []),
        newsAPI.getAll(token).catch(() => []),
        tagAPI.getAll(token).catch(() => []),
      ]);

      setData({
        systemAccounts: accounts || [],
        categories: categories || [],
        newsArticles: news || [],
        tags: tags || [],
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, isAdmin]);

  // Load staff news when history tab is active
  useEffect(() => {
    const loadStaffNews = async () => {
      if (activeTab === "history" && user?.id && isStaff) {
        try {
          const token = localStorage.getItem('token');
          const news = await newsAPI.getByCreator(user.id, token);
          setStaffNews(news || []);
        } catch (error) {
          console.error('Error loading staff news:', error);
          // Fallback: filter từ data hiện tại
          setStaffNews(data.newsArticles.filter(
            (article) => article.createdByID === user.id
          ));
        }
      }
    };
    
    loadStaffNews();
  }, [activeTab, user?.id, isStaff, data.newsArticles]);

  // Helper functions
  const getCategoryName = (categoryID) => {
    const category = data.categories.find((cat) => cat.categoryID === categoryID);
    return category ? category.categoryName : "Unknown";
  };

  const getAccountName = (accountID) => {
    const account = data.systemAccounts.find((acc) => acc.accountID === accountID);
    return account ? account.accountName : "Unknown";
  };

  // Backend trả về tagIDs array trong NewsArticle, không cần newsTags riêng
  const getNewsTags = (article) => {
    if (!article.tagIDs || article.tagIDs.length === 0) return "";
    const tagNames = article.tagIDs
      .map((tagID) => {
        const tag = data.tags.find((t) => t.tagID === tagID);
        return tag ? tag.tagName : "";
      })
      .filter((name) => name !== "");
    return tagNames.join(", ");
  };

  // Search với API hoặc local filter
  const [searchResults, setSearchResults] = useState(null);
  
  useEffect(() => {
    const searchWithAPI = async () => {
      if (!searchTerm.trim()) {
        setSearchResults(null);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        let results = [];

        switch (activeTab) {
          case "users":
            if (isAdmin) {
              results = await accountAPI.search(searchTerm, token);
              setSearchResults({ systemAccounts: results });
            }
            break;
          case "category":
            results = await categoryAPI.search(searchTerm, token);
            setSearchResults({ categories: results });
            break;
          case "news":
            results = await newsAPI.search(searchTerm, token);
            setSearchResults({ newsArticles: results });
            break;
          case "tags":
            results = await tagAPI.search(searchTerm, token);
            setSearchResults({ tags: results });
            break;
          default:
            setSearchResults(null);
        }
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Lỗi tìm kiếm: ' + error.message);
        setSearchResults(null);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchWithAPI();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeTab, isAdmin]);

  // Local filter fallback (nếu không dùng API search)
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

  const handleDeleteAccount = async (accountID) => {
    try {
      const token = localStorage.getItem('token');
      // Check can-delete trước
      const canDelete = await accountAPI.checkCanDelete(accountID, token);
      
      if (!canDelete.canDelete) {
        toast.error("Không thể xóa tài khoản này. Tài khoản đã tạo tin tức.");
        return;
      }

      // Chỉ lưu ID và type, KHÔNG gọi API ngay
      setItemToDelete({ type: 'account', id: accountID });
      setConfirmOpen(true);
    } catch (error) {
      toast.error("Lỗi kiểm tra: " + error.message);
    }
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

  const handleSaveAccount = async () => {
    const errors = validateAccount();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const accountData = {
        accountName: formData.accountName,
        accountEmail: formData.accountEmail,
        accountPassword: formData.accountPassword,
        accountRole: parseInt(formData.accountRole),
      };

      if (modalMode === "create") {
        await accountAPI.create(accountData, token);
        toast.success("Thêm tài khoản thành công!");
      } else {
        await accountAPI.update(currentItem.accountID, accountData, token);
        toast.success("Cập nhật tài khoản thành công!");
      }
      
      await loadData(); // Reload data
      setModalOpen(false);
      setFormData({});
      setFormErrors({});
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
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

  const handleDeleteCategory = async (categoryID) => {
    try {
      const token = localStorage.getItem('token');
      // Check can-delete trước
      const canDelete = await categoryAPI.checkCanDelete(categoryID, token);
      
      if (!canDelete.canDelete) {
        toast.error("Không thể xóa danh mục này. Danh mục đã được sử dụng trong tin tức.");
        return;
      }

      // Chỉ lưu ID và type, KHÔNG gọi API ngay
      setItemToDelete({ type: 'category', id: categoryID });
      setConfirmOpen(true);
    } catch (error) {
      toast.error("Lỗi kiểm tra: " + error.message);
    }
  };

  const validateCategory = () => {
    const errors = {};
    if (!formData.categoryName?.trim()) errors.categoryName = "Tên danh mục là bắt buộc";
    return errors;
  };

  const handleSaveCategory = async () => {
    const errors = validateCategory();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const categoryData = {
        categoryName: formData.categoryName,
        categoryDescription: formData.categoryDescription || "",
        parentCategoryID: formData.parentCategoryID ? parseInt(formData.parentCategoryID) : null,
        isActive: formData.isActive !== false ? 1 : 0, // Convert boolean to int
      };

      if (modalMode === "create") {
        await categoryAPI.create(categoryData, token);
        toast.success("Thêm danh mục thành công!");
      } else {
        await categoryAPI.update(currentItem.categoryID, categoryData, token);
        toast.success("Cập nhật danh mục thành công!");
      }
      
      await loadData(); // Reload data
      setModalOpen(false);
      setFormData({});
      setFormErrors({});
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
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
    // Backend trả về tagIDs array, không cần filter từ newsTags
    setFormData({ ...article, tagIDs: article.tagIDs || [] });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleDeleteNews = (newsArticleID) => {
    // Chỉ lưu ID và type, KHÔNG gọi API ngay
    setItemToDelete({ type: 'news', id: newsArticleID });
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

  const handleSaveNews = async () => {
    const errors = validateNews();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Staff can only create news as themselves
      const createdByID = isStaff ? user?.id : parseInt(formData.createdByID);
      
      const newsData = {
        newsTitle: formData.newsTitle,
        headline: formData.headline,
        newsContent: formData.newsContent,
        newsSource: formData.newsSource || "FUNews",
        categoryID: parseInt(formData.categoryID),
        newsStatus: parseInt(formData.newsStatus),
        createdByID: createdByID,
        tagIDs: (formData.tagIDs || []).map(id => parseInt(id)), // Backend nhận tagIDs array
      };

      if (modalMode === "create") {
        await newsAPI.create(newsData, token);
        toast.success("Thêm tin tức thành công!");
      } else {
        await newsAPI.update(currentItem.newsArticleID, newsData, token);
        toast.success("Cập nhật tin tức thành công!");
      }
      
      await loadData(); // Reload data
      setModalOpen(false);
      setFormData({});
      setFormErrors({});
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  // CRUD Operations for Profile (Staff only)
  const handleSaveProfile = async () => {
    const errors = {};
    if (!formData.accountName?.trim()) errors.accountName = "Tên tài khoản là bắt buộc";
    if (!formData.accountEmail?.trim()) errors.accountEmail = "Email là bắt buộc";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.accountEmail))
      errors.accountEmail = "Email không hợp lệ";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const profileData = {
        accountName: formData.accountName,
        accountEmail: formData.accountEmail,
      };
      
      // Only update password if provided
      if (formData.accountPassword?.trim()) {
        profileData.accountPassword = formData.accountPassword;
      }

      await profileAPI.updateProfile(profileData, token);
      
      // Update user context
      const updatedUser = {
        ...user,
        accountName: formData.accountName,
        accountEmail: formData.accountEmail,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      await loadData(); // Reload data
      toast.success("Cập nhật profile thành công!");
      setModalOpen(false);
      setFormData({});
      setFormErrors({});
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
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
    // Chỉ lưu ID và type, KHÔNG gọi API ngay
    setItemToDelete({ type: 'tag', id: tagID });
    setConfirmOpen(true);
  };

  const validateTag = () => {
    const errors = {};
    if (!formData.tagName?.trim()) errors.tagName = "Tên tag là bắt buộc";
    return errors;
  };

  const handleSaveTag = async () => {
    const errors = validateTag();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const tagData = {
        tagName: formData.tagName,
        note: formData.note || "",
      };

      if (modalMode === "create") {
        await tagAPI.create(tagData, token);
        toast.success("Thêm tag thành công!");
      } else {
        await tagAPI.update(currentItem.tagID, tagData, token);
        toast.success("Cập nhật tag thành công!");
      }
      
      await loadData(); // Reload data
      setModalOpen(false);
      setFormData({});
      setFormErrors({});
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  // Get filtered data based on active tab (dùng searchResults nếu có, nếu không dùng local filter)
  const getFilteredData = () => {
    // Nếu có search results từ API, dùng kết quả đó
    if (searchResults) {
      switch (activeTab) {
        case "users":
          return searchResults.systemAccounts || [];
        case "category":
          return searchResults.categories || [];
        case "news":
          return searchResults.newsArticles || [];
        case "tags":
          return searchResults.tags || [];
        default:
          return [];
      }
    }
    
    // Nếu không có search term, trả về tất cả data
    if (!searchTerm) {
      switch (activeTab) {
        case "users":
          return data.systemAccounts;
        case "category":
          return data.categories;
        case "news":
          return data.newsArticles;
        case "tags":
          return data.tags;
        default:
          return [];
      }
    }
    
    // Fallback: local filter
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
                    {getNewsTags(article) && (
                      <div className="news-tags">
                        {getNewsTags(article).split(", ").map((tag, index) => (
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
                      <td>{getNewsTags(article) || "None"}</td>
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
                            type="button"
                            className="btn-delete"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteNews(article.newsArticleID);
                            }}
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
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const profile = await profileAPI.getProfile(token);
                    if (profile) {
                      setModalMode("edit");
                      setCurrentItem(profile);
                      setFormData({ ...profile, accountPassword: "" });
                      setFormErrors({});
                      setModalOpen(true);
                    }
                  } catch (error) {
                    toast.error("Lỗi tải profile: " + error.message);
                    // Fallback: dùng user từ context
                    const currentAccount = data.systemAccounts.find(
                      (acc) => acc.accountID === user?.id
                    ) || user;
                    if (currentAccount) {
                      setModalMode("edit");
                      setCurrentItem(currentAccount);
                      setFormData({ ...currentAccount, accountPassword: "" });
                      setFormErrors({});
                      setModalOpen(true);
                    }
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
        
        const filteredStaffNews = searchTerm 
          ? filterData(staffNews, ["newsTitle", "headline", "newsContent"])
          : staffNews;
        
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
                        <td>{getNewsTags(article) || "None"}</td>
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
                              type="button"
                              className="btn-delete"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteNews(article.newsArticleID);
                              }}
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
          categories={data.categories.filter((cat) => cat.isActive === 1 || cat.isActive === true)}
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

  if (loading) {
    return (
      <div className="admin-page">
        <Header />
        <div className="admin-container">
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

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
        onClose={() => {
          setConfirmOpen(false);
          setItemToDelete(null); // Clear item khi đóng
          setDeleteCallback(null); // Clear callback khi đóng (cho các delete khác)
        }}
        onConfirm={async () => {
          if (!itemToDelete) {
            setConfirmOpen(false);
            return;
          }

          try {
            const token = localStorage.getItem('token');
            
            // Gọi API delete dựa trên type - CHỈ KHI USER CLICK "XÁC NHẬN"
            if (itemToDelete.type === 'news') {
              await newsAPI.delete(itemToDelete.id, token);
              await loadData(); // Reload data
              toast.success("Xóa tin tức thành công!");
            } else if (itemToDelete.type === 'account') {
              await accountAPI.delete(itemToDelete.id, token);
              await loadData();
              toast.success("Xóa tài khoản thành công!");
            } else if (itemToDelete.type === 'category') {
              await categoryAPI.delete(itemToDelete.id, token);
              await loadData();
              toast.success("Xóa danh mục thành công!");
            } else if (itemToDelete.type === 'tag') {
              await tagAPI.delete(itemToDelete.id, token);
              await loadData();
              toast.success("Xóa tag thành công!");
            }
            
            setItemToDelete(null);
            setConfirmOpen(false);
          } catch (error) {
            toast.error("Lỗi xóa: " + error.message);
            // Không đóng dialog nếu có lỗi
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
