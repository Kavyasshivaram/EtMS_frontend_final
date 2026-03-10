import {
  FaBook,
  FaChalkboardTeacher,
  FaUsers,
  FaBell,
  FaSearch,
  FaLayerGroup,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import api from "../../api/axiosConfig";

import "./AdminDashboard.css";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState({
    totalCourses: 0,
    totalTrainers: 0,
    totalStudents: 0,
    activeBatches: 0
  });

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchDashboardData();
    fetchAllUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await api.get("/admin/all-users");
      setUsers(res.data);
      const pending = res.data.filter(u => u.status === "PENDING").length;
      setPendingCount(pending);
    } catch (err) {
      console.error(err);
    }
  };

  const approveUser = async (id) => {
    await api.put(`/admin/approve-user/${id}`);
    fetchAllUsers();
  };

  const rejectUser = async (id) => {
    await api.put(`/admin/reject-user/${id}`);
    fetchAllUsers();
  };

  const deactivateUser = async (id) => {
    await api.put(`/admin/deactivate-user/${id}`);
    fetchAllUsers();
  };

  const reactivateUser = async (id) => {
    await api.put(`/admin/approve-user/${id}`);
    fetchAllUsers();
  };

  const toggleNotifications = () => setShowNotifications(!showNotifications);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter & Pagination Logic + PENDING CANDIDATES FIRST SORT
  const filteredUsers = users
    .filter((u) => {
      const text = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(text) ||
        u.email?.toLowerCase().includes(text) ||
        u.phone?.toLowerCase().includes(text)
      );
    })
    .sort((a, b) => {
      // Logic: If 'a' is PENDING and 'b' is not, 'a' comes first (-1)
      if (a.status === "PENDING" && b.status !== "PENDING") return -1;
      if (a.status !== "PENDING" && b.status === "PENDING") return 1;
      return 0; // Otherwise keep original order
    });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredUsers.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(filteredUsers.length / recordsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="admin-dashboard-wrapper">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Admin Portal</h1>
          <p>Welcome, <span className="admin-name">{user?.name || "Administrator"}</span></p>
        </div>

        <div className="header-right" ref={notificationRef}>
          <div className="notification-trigger" onClick={toggleNotifications}>
            <FaBell className="bell-icon" />
            {pendingCount > 0 && (
              <span className="notification-badge">{pendingCount}</span>
            )}
          </div>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-arrow"></div>
              <div className="dropdown-header">Pending Approvals</div>
              <div className="dropdown-body">
                {users.filter(u => u.status === "PENDING").length > 0 ? (
                  users.filter(u => u.status === "PENDING").map(u => (
                    <div key={u.id} className="dropdown-item">
                      <strong>{u.name}</strong>
                      <span>Role: {u.role?.roleName}</span>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-empty">No pending requests</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="stats-grid">
        {[
          { label: "Total Courses", val: data.totalCourses, icon: <FaBook /> },
          { label: "Total Trainers", val: data.totalTrainers, icon: <FaChalkboardTeacher /> },
          { label: "Total Students", val: data.totalStudents, icon: <FaUsers /> },
          { label: "Active Batches", val: data.activeBatches, icon: <FaLayerGroup /> }
        ].map((item, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-icon-container">{item.icon}</div>
            <div className="stat-text">
              <p>{item.label}</p>
              <h2>{item.val}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* USER MANAGEMENT SECTION */}
      <div className="user-management-section">
        <div className="section-header">
          <div className="title-group">
            <h2>User Management</h2>
            <div className="search-bar">
              <FaSearch />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* PAGINATION ON TOP */}
          {nPages > 1 && (
            <div className="top-pagination">
              <span className="page-info">Page {currentPage} of {nPages}</span>
              <div className="page-controls">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="ctrl-btn"
                ><FaChevronLeft /></button>
                <button 
                  disabled={currentPage === nPages} 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="ctrl-btn"
                ><FaChevronRight /></button>
              </div>
            </div>
          )}
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>User Role</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="cell-user">
                        <span className="name">{u.name}</span>
                        <span className="sub">{u.email} | {u.phone}</span>
                      </div>
                    </td>
                    <td><span className="role-tag">{u.role?.roleName}</span></td>
                    <td>
                      <span className={`status-dot status-${u.status.toLowerCase()}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group">
                        {u.status === "ACTIVE" && (
                          <button onClick={() => deactivateUser(u.id)} className="btn-danger-outline">Deactivate</button>
                        )}
                        {u.status === "PENDING" && (
                          <>
                            <button onClick={() => approveUser(u.id)} className="btn-primary-sm">Approve</button>
                            <button onClick={() => rejectUser(u.id)} className="btn-danger-sm">Reject</button>
                          </>
                        )}
                        {(u.status === "INACTIVE" || u.status === "REJECTED") && (
                          <button onClick={() => reactivateUser(u.id)} className="btn-primary-sm">Activate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-row">No candidates matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;