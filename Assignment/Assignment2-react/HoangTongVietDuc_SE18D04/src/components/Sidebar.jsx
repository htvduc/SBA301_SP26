import "../styles/Sidebar.css";
import useAuth from "../stores/useAuth";

const allMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊", roles: ["admin", "staff"] },
  { id: "news", label: "News", icon: "📰", roles: ["staff"] },
  { id: "category", label: "Category", icon: "📁", roles: ["staff"] },
  { id: "tags", label: "Tags", icon: "🏷️", roles: ["staff"] },
  { id: "users", label: "Users", icon: "👥", roles: ["admin"] },
  { id: "profile", label: "Profile", icon: "👤", roles: ["staff"] },
  { id: "history", label: "News History", icon: "📜", roles: ["staff"] },
];

function Sidebar({ activeTab, onTabChange }) {
  const { user } = useAuth();
  const userRole = user?.accountRole === 1 ? "admin" : "staff";
  
  const menuItems = allMenuItems.filter((item) => 
    item.roles.includes(userRole)
  );

  return (
    <nav className="admin-sidebar">
      <div className="sidebar-header">
        <h3>Menu</h3>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              className={`menu-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;
