import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import "./SuperAdminDashboard.css";

function SuperAdminDashboard() {
  const navigate = useNavigate(); // ✅ Add this

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const dropdownRef = useRef(null);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/superadmin/dashboard");
      setDashboard(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
      } else if (error.response?.status === 403) {
        setError("Access Denied. Only Super Admin allowed.");
      } else {
        setError("Failed to load dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>{error}</h3>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="dashboard-wrapper">

      {/* ===== HEADER SECTION ===== */}
      <div className="dashboard-topbar">

        <div className="welcome-section">
          <h1>
            Welcome back, {user?.name || "Super Admin"} 👑
          </h1>
          <p className="subtitle">
            Monitor system performance and platform growth.
          </p>
        </div>

        <div className="topbar-actions">

          {/* ===== Notifications ===== */}
          <div className="notification-wrapper">
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {dashboard.recentActivities?.length > 0 && (
                <span className="notification-badge">
                  {dashboard.recentActivities.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <h4>Notifications</h4>
                {dashboard.recentActivities?.length === 0 ? (
                  <p className="empty-activity">
                    No new notifications
                  </p>
                ) : (
                  <ul>
                    {dashboard.recentActivities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* ===== Profile Menu ===== */}
          <div className="profile-wrapper" ref={dropdownRef}>
            <div
              className="avatar"
              onClick={() =>
                setShowProfileMenu(!showProfileMenu)
              }
            >
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>

            {showProfileMenu && (


              <div className="profile-dropdown">
                <div className="profile-info">
                  <strong>{user?.name}</strong>
                  <span>{user?.email}</span>
                  <small>Role: SUPER_ADMIN</small>
                </div>

                <hr />
<button
  className="dropdown-item"
  onClick={() => navigate("/superadmin/profile")}
>
  👤 View Profile
</button>

<button
  className="dropdown-item"
  onClick={() => navigate("/superadmin/change-password")}
>
  🔑 Change Password
</button>

<button
  className="dropdown-item"
  onClick={() => navigate("/superadmin/settings")}
>
  ⚙️ System Settings
</button>

                <hr />

                <button
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>

              
            )}
          </div>
        </div>
      </div>

      {/* ===== CONTENT SECTION ===== */}
      <div className="dashboard-content">

        <div className="stats-grid">
          <StatCard title="Total Courses" value={dashboard.totalCourses} />
          <StatCard title="Total Trainers" value={dashboard.totalTrainers} />
          <StatCard title="Total Students" value={dashboard.totalStudents} />
          <StatCard title="Active Batches" value={dashboard.activeBatches} />
          <StatCard title="Total Admins" value={dashboard.totalAdmins} />
          <StatCard title="Total Sub-Admins" value={dashboard.totalSubAdmins} />
          <StatCard title="Total Marketers" value={dashboard.totalMarketers} />
          <StatCard
            title="Total Revenue"
            value={`₹ ${dashboard.totalRevenue?.toLocaleString() || 0}`}
            highlight
          />
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, highlight }) {
  return (
    <div className={`stat-card ${highlight ? "highlight" : ""}`}>
      <h4>{title}</h4>
      <p>{value ?? 0}</p>
    </div>
  );
}

export default SuperAdminDashboard;