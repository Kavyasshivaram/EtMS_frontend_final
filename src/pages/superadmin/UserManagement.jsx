import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import "./UserManagement.css";
import "./SuperAdminCommon.css";
import { FaUserPlus, FaSearch, FaFilter, FaTrafficLight, FaUserShield, FaUserTie, FaUserGraduate, FaUserTag, FaUsers } from "react-icons/fa";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Edit User State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    studentId: "" // This maps to portalId in backend update
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/superadmin/users/all");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/superadmin/users/toggle-status/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role.roleName,
      studentId: user.portalId || user.studentId || ""
    });
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`/superadmin/users/update/${editingUser.id}`, editForm);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                        u.email.toLowerCase().includes(search.toLowerCase()) ||
                        (u.studentId && u.studentId.toLowerCase().includes(search.toLowerCase())) ||
                        (u.portalId && u.portalId.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === "ALL" || u.role.roleName === roleFilter;
    const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case "SUPERADMIN": return <FaUserShield style={{color: '#f59e0b'}} />;
      case "ADMIN": return <FaUserShield style={{color: '#2347c5'}} />;
      case "TRAINER": return <FaUserTie style={{color: '#16a34a'}} />;
      case "STUDENT": return <FaUserGraduate style={{color: '#2f59e0'}} />;
      case "MARKETER": return <FaUserTag style={{color: '#f97316'}} />;
      default: return <FaUserTag />;
    }
  };

  return (
    <div className="sa-page">
      <div className="sa-wrapper um-wrapper-extra">
        
        {/* ── SIDE PANEL ── */}
        <div className="sa-side-panel">
          <div className="sa-side-brand">
            <span className="cu-side-et">Et</span><span className="cu-side-ms">MS</span>
          </div>
          <h2 className="sa-side-title">User Directory</h2>
          <p className="sa-side-desc">
            Global oversight and lifecycle management for all platform members across every role.
          </p>

          <div className="um-side-stats">
            <div className="um-ss-item">
              <span className="um-ss-val">{users.length}</span>
              <span className="um-ss-lbl">Total Members</span>
            </div>
            <div className="um-ss-divider" />
            <div className="um-ss-item">
              <span className="um-ss-val">🟢</span>
              <span className="um-ss-lbl">Active Synced</span>
            </div>
          </div>

          <div className="um-side-illustration">
            <FaUsers size={120} style={{opacity: 0.15}} />
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="um-main-panel">
          <div className="um-header">
            <div className="um-header__left">
              <h1>Universal Directory</h1>
              <p>Managing {filteredUsers.length} members matching current filters</p>
            </div>
            <button className="um-btn--primary" onClick={() => window.location.href = "/#/superadmin/create-user"}>
              <FaUserPlus /> Provision User
            </button>
          </div>

          <div className="um-controls">
            <div className="um-search">
              <FaSearch className="um-search-icon" />
              <input 
                type="text" 
                placeholder="Search name, email or ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="um-filters">
              <div className="um-filter-group">
                <FaFilter />
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="ALL">All Roles</option>
                  <option value="SUPERADMIN">Super Admins</option>
                  <option value="ADMIN">Admins</option>
                  <option value="TRAINER">Trainers</option>
                  <option value="STUDENT">Students</option>
                  <option value="MARKETER">Marketers</option>
                </select>
              </div>
              <div className="um-filter-group">
                <FaTrafficLight />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="um-table-container">
            {loading ? (
              <div className="um-loader">
                <div className="um-spinner"></div>
                <p>Scanning global registry...</p>
              </div>
            ) : (
              <table className="um-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="um-member-cell">
                          <div className="um-avatar">{u.name.charAt(0)}</div>
                          <div className="um-member-info">
                            <span className="um-name">{u.name}</span>
                             <span className="um-email-main" style={{fontSize: '0.85rem', color: '#64748b'}}>{u.email}</span>
                            {(u.portalId || u.studentId) && (
                              <span className="um-id-sub" style={{
                                fontSize: '0.75rem', 
                                color: '#2f59e0', 
                                fontWeight: '800', 
                                fontFamily: 'JetBrains Mono, monospace',
                                background: 'rgba(47, 89, 224, 0.1)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                marginTop: '4px',
                                display: 'inline-block'
                              }}>
                                {u.portalId || u.studentId}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="um-role-badge">
                          {getRoleIcon(u.role.roleName)}
                          <span>{u.role.roleName}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`um-status-pill um-status--${u.status.toLowerCase()}`}>
                          ● {u.status}
                        </span>
                      </td>
                      <td>
                         <button 
                          className="um-action-pill edit"
                          onClick={() => handleEditClick(u)}
                          style={{marginRight: '8px', background: '#f59e0b', color: 'white', border: 'none'}}
                        >
                          Edit
                        </button>
                        <button 
                          className={`um-action-pill ${u.status === 'ACTIVE' ? 'suspend' : 'reinstate'}`}
                          onClick={() => toggleStatus(u.id)}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Reinstate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
       </div>

      {/* ── EDIT MODAL ── */}
      {showEditModal && (
        <div className="um-modal-overlay">
          <div className="um-modal">
            <div className="um-modal-header">
              <h2>Edit Member Details</h2>
              <button 
                className="um-modal-close" 
                onClick={() => setShowEditModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="um-modal-form">
              <div className="um-form-row">
                <div className="um-form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>
                <div className="um-form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="um-form-row">
                <div className="um-form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  />
                </div>
                <div className="um-form-group">
                  <label>Role</label>
                  <select 
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  >
                    <option value="SUPERADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="TRAINER">Trainer</option>
                    <option value="STUDENT">Student</option>
                    <option value="MARKETER">Marketer</option>
                  </select>
                </div>
              </div>

              <div className="um-form-group">
                <label>System / Portal ID</label>
                <input 
                  type="text" 
                  value={editForm.studentId}
                  onChange={(e) => setEditForm({...editForm, studentId: e.target.value})}
                  placeholder="e.g. STU-2026-0001"
                />
              </div>

              <div className="um-modal-footer">
                <button 
                  type="button" 
                  className="um-modal-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="um-modal-save"
                  disabled={updating}
                >
                  {updating ? "Saving Changes..." : "Update Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
