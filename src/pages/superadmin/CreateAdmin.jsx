import { useEffect, useState, useRef } from "react";
import api from "../../api/axiosConfig";
import "./CreateAdmin.css";

function CreateAdmin() {
  const user = JSON.parse(localStorage.getItem("user"));
  const dropdownRef = useRef();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
    permissions: [],
    status: "ACTIVE"
  });

  const availablePermissions = [
    "MANAGE_COURSES",
    "MANAGE_STUDENTS",
    "MANAGE_TRAINERS",
    "VIEW_REPORTS",
    "MANAGE_BATCHES"
  ];

  useEffect(() => {
    fetchAdmins();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get("/superadmin/admins");
      setAdmins(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permission)
          : [...prev.permissions, permission]
      };
    });
  };

  const openCreateModal = () => {
    setEditingAdmin(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "ADMIN",
      permissions: [],
      status: "ACTIVE"
    });
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role?.roleName || "ADMIN",
      permissions: admin.permissions
        ? admin.permissions.map((p) => p.permissionName)
        : [],
      status: admin.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin?")) return;

    try {
      await api.delete(`/superadmin/delete-admin/${id}`);
      fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAdmin) {
        await api.put(
          `/superadmin/update-admin/${editingAdmin.id}`,
          formData
        );
      } else {
        await api.post(
          "/superadmin/create-admin",
          formData
        );
      }

      fetchAdmins();
      setShowModal(false);

    } catch (error) {
      console.error("Save error:", error);
      alert("Something went wrong.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="admin-wrapper">

      <div className="dashboard-topbar">
        <div className="welcome-section">
          <h1>Admin Management</h1>
          <p className="subtitle">
            Manage and assign admin roles & permissions
          </p>
        </div>

        <div className="topbar-actions">

          <div className="notification-wrapper">
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {admins.length > 0 && (
                <span className="notification-badge">
                  {admins.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <h4>Admins</h4>
                {admins.length === 0 ? (
                  <p>No admins available</p>
                ) : (
                  <ul>
                    {admins.map((admin) => (
                      <li key={admin.id}>
                        {admin.name} ({admin.status})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

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

                <button className="dropdown-item">👤 View Profile</button>
                <button className="dropdown-item">🔑 Change Password</button>
                <button className="dropdown-item">⚙️ System Settings</button>

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

      <div className="admin-content">

        <div className="create-admin-section">
          <button className="primary-btn" onClick={openCreateModal}>
            + Create Admin
          </button>
        </div>

        <div className="data-card">

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                    <td>{admin.role?.roleName}</td>
                    <td>
                      <span
                        className={
                          admin.status === "ACTIVE"
                            ? "badge-active"
                            : "badge-inactive"
                        }
                      >
                        {admin.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(admin)}
                      >
                        Edit
                      </button>

                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(admin.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal large">
            <h3>{editingAdmin ? "Edit Admin" : "Create Admin"}</h3>

            <form onSubmit={handleSubmit}>

              <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              {!editingAdmin && (
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              )}

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="ADMIN">ADMIN</option>
                <option value="SUB_ADMIN">SUB_ADMIN</option>
              </select>

              <label className="permission-label">
                Assign Permissions:
              </label>

              <div className="permissions-grid">
                {availablePermissions.map((perm) => (
                  <label key={perm} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm)}
                      onChange={() => handlePermissionChange(perm)}
                    />
                    {perm}
                  </label>
                ))}
              </div>

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>

              <div className="modal-actions">
                <button type="submit" className="primary-btn">
                  {editingAdmin ? "Update" : "Create"}
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default CreateAdmin;