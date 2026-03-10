import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, NavLink, Link } from "react-router-dom";
import { 
  FaPhoneAlt, FaEnvelope, FaFacebookF, FaTwitter, 
  FaLinkedinIn, FaInstagram, FaGraduationCap, FaSignOutAlt,
  FaChevronDown, FaCog, FaShieldAlt, FaBullhorn,
  FaBook, FaBriefcase, FaHeadset
} from "react-icons/fa";
import "./DashboardLayout.css";

function DashboardLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";
  const rolePath = user?.role?.toLowerCase().replace("_", "") || "student";

  return (
    <div className="dashboard-page-wrapper">
      {/* ===== TOP BAR ===== */}
      <div className="top-contact-bar">
        <div className="nav-container-inner">
          <div className="contact-left">
            <span><FaPhoneAlt size={12} /> +91 7022928198</span>
            <span className="v-sep">|</span>
            <span><FaEnvelope size={12} /> appteknow-pcsglobal@gmail.com</span>
          </div>
          <div className="social-right">
            <FaFacebookF /> <FaTwitter /> <FaLinkedinIn /> <FaInstagram />
          </div>
        </div>
      </div>

      {/* ===== MAIN HEADER ===== */}
      <header className="main-dashboard-header">
        <div className="nav-container-inner" ref={dropdownRef}>
          
          <Link to="/" className="logo-section-left">
            <div className="logo-icon-box"><FaGraduationCap /></div>
            <div className="logo-text-group">
              <h1 className="brand-name">EtMS</h1>
              <span className="brand-tagline">SMART LEARNING</span>
            </div>
          </Link>

          <nav className="header-nav-menu">
            <NavLink to={`/${rolePath}/dashboard`} className="nav-menu-link">📊 Dashboard</NavLink>

            {/* SUPER ADMIN */}
            {user?.role === "SUPER_ADMIN" && (
              <div className="nav-dropdown">
                <button className={`nav-menu-link ${activeDropdown === 'super' ? 'active-btn' : ''}`} onClick={() => toggleDropdown('super')}>
                  <FaShieldAlt /> Governance <FaChevronDown className={`drop-icon ${activeDropdown === 'super' ? 'rotate' : ''}`} />
                </button>
                {activeDropdown === 'super' && (
                  <div className="dropdown-content">
                    <NavLink to="/superadmin/create-admin" onClick={() => setActiveDropdown(null)}>🛡️ Manage Admins</NavLink>
                    <NavLink to="/superadmin/marketers" onClick={() => setActiveDropdown(null)}>👨‍💼 Manage Marketers</NavLink>
                    <NavLink to="/superadmin/revenue" onClick={() => setActiveDropdown(null)}>💰 Revenue Reports</NavLink>
                    <NavLink to="/superadmin/settings" onClick={() => setActiveDropdown(null)}>⚙️ System Settings</NavLink>
                  </div>
                )}
              </div>
            )}

            {/* ADMIN */}
            {user?.role === "ADMIN" && (
              <>
                <div className="nav-dropdown">
                  <button className={`nav-menu-link ${activeDropdown === 'admin' ? 'active-btn' : ''}`} onClick={() => toggleDropdown('admin')}>
                    <FaCog /> System Ops <FaChevronDown className={`drop-icon ${activeDropdown === 'admin' ? 'rotate' : ''}`} />
                  </button>
                  {activeDropdown === 'admin' && (
                    <div className="dropdown-content">
                      <NavLink to="/admin/create-course" onClick={() => setActiveDropdown(null)}>➕ Create Course</NavLink>
                      <NavLink to="/admin/courses" onClick={() => setActiveDropdown(null)}>📚 All Courses</NavLink>
                      <NavLink to="/admin/create-batch" onClick={() => setActiveDropdown(null)}>🗂 Create Batch</NavLink>
                      <NavLink to="/admin/assign-trainer" onClick={() => setActiveDropdown(null)}>👨‍🏫 Trainer Assignment</NavLink>
                      <NavLink to="/admin/schedule-class" onClick={() => setActiveDropdown(null)}>⏰ Schedule Class</NavLink>
                      <NavLink to="/admin/students" onClick={() => setActiveDropdown(null)}>👨‍🎓 Manage Students</NavLink>
                      <NavLink to="/admin/attendance" onClick={() => setActiveDropdown(null)}>🗓 Attendance</NavLink>
                    </div>
                  )}
                </div>

                <div className="nav-dropdown">
                  <button className={`nav-menu-link ${activeDropdown === 'admin-career' ? 'active-btn' : ''}`} onClick={() => toggleDropdown('admin-career')}>
                    <FaBriefcase /> Career Hub <FaChevronDown className={`drop-icon ${activeDropdown === 'admin-career' ? 'rotate' : ''}`} />
                  </button>
                  {activeDropdown === 'admin-career' && (
                    <div className="dropdown-content">
                      <NavLink to="/admin/post-job" onClick={() => setActiveDropdown(null)}>💼 Post New Job</NavLink>
                      <NavLink to="/admin/manage-jobs" onClick={() => setActiveDropdown(null)}>📝 Manage Listings</NavLink>
                      <NavLink to="/admin/post-internship" onClick={() => setActiveDropdown(null)}>🎓 Post Internship</NavLink>
                      <NavLink to="/admin/job-applications" onClick={() => setActiveDropdown(null)}>📥 View Applications</NavLink>
                      <NavLink to="/admin/company-partners" onClick={() => setActiveDropdown(null)}>🏢 Industry Partners</NavLink>
                      <NavLink to="/admin/placement-stats" onClick={() => setActiveDropdown(null)}>📈 Placement Reports</NavLink>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TRAINER */}
            {user?.role === "TRAINER" && (
              <div className="nav-dropdown">
                <button className={`nav-menu-link ${activeDropdown === 'trainer' ? 'active-btn' : ''}`} onClick={() => toggleDropdown('trainer')}>
                  <FaBook /> Academic <FaChevronDown className={`drop-icon ${activeDropdown === 'trainer' ? 'rotate' : ''}`} />
                </button>
                {activeDropdown === 'trainer' && (
                  <div className="dropdown-content">
                    <NavLink to="/trainer/course" onClick={() => setActiveDropdown(null)}>📚 My Courses</NavLink>
                    <NavLink to="/trainer/attendance" onClick={() => setActiveDropdown(null)}>🗓 Attendance</NavLink>
                    <NavLink to="/trainer/assignments" onClick={() => setActiveDropdown(null)}>📝 Assignments</NavLink>
                    <NavLink to="/trainer/materials" onClick={() => setActiveDropdown(null)}>📂 Study Materials</NavLink>
                  </div>
                )}
              </div>
            )}

            {/* MARKETER */}
            {user?.role === "MARKETER" && (
              <div className="nav-dropdown">
                <button className={`nav-menu-link ${activeDropdown === 'marketing' ? 'active-btn' : ''}`} onClick={() => toggleDropdown('marketing')}>
                  <FaBullhorn /> Marketing <FaChevronDown className={`drop-icon ${activeDropdown === 'marketing' ? 'rotate' : ''}`} />
                </button>
                {activeDropdown === 'marketing' && (
                  <div className="dropdown-content">
                    <NavLink to="/marketer/leads" onClick={() => setActiveDropdown(null)}>🎯 Lead Management</NavLink>
                    <NavLink to="/marketer/campaigns" onClick={() => setActiveDropdown(null)}>📣 Campaigns</NavLink>
                    <NavLink to="/marketer/vouchers" onClick={() => setActiveDropdown(null)}>🎟️ Vouchers</NavLink>
                  </div>
                )}
              </div>
            )}

            {/* STUDENT */}
            {user?.role === "STUDENT" && (
              <>
                <div className="nav-dropdown">
                  <button className={`nav-menu-link ${activeDropdown === 'st-learn' ? 'active-btn' : ''}`} onClick={() => toggleDropdown('st-learn')}>
                    <FaBook /> Learning Hub <FaChevronDown className={`drop-icon ${activeDropdown === 'st-learn' ? 'rotate' : ''}`} />
                  </button>
                  {activeDropdown === 'st-learn' && (
                    <div className="dropdown-content">
                      <NavLink to="/student/courses" onClick={() => setActiveDropdown(null)}>📚 My Courses</NavLink>
                      <NavLink to="/student/attendance" onClick={() => setActiveDropdown(null)}>🗓 Attendance</NavLink>
                      <NavLink to="/student/assignments" onClick={() => setActiveDropdown(null)}>📝 Assignments</NavLink>
                      <NavLink to="/student/results" onClick={() => setActiveDropdown(null)}>📊 Results</NavLink>
                    </div>
                  )}
                </div>
                <div className="nav-dropdown">
                  <button className={`nav-menu-link ${activeDropdown === 'st-hiring' ? 'active-btn' : ''}`} onClick={() => toggleDropdown('st-hiring')}>
                    <FaBriefcase /> Hiring <FaChevronDown className={`drop-icon ${activeDropdown === 'st-hiring' ? 'rotate' : ''}`} />
                  </button>
                  {activeDropdown === 'st-hiring' && (
                    <div className="dropdown-content">
                      <NavLink to="/student/jobs" onClick={() => setActiveDropdown(null)}>🏢 Jobs</NavLink>
                      <NavLink to="/student/internships" onClick={() => setActiveDropdown(null)}>🎓 Internships</NavLink>
                    </div>
                  )}
                </div>
              </>
            )}

            <NavLink to={`/${rolePath}/performance`} className="nav-menu-link">📈 Performance</NavLink>
            <NavLink to={`/${rolePath}/profile`} className="nav-menu-link">👤 Profile</NavLink>
          </nav>

          <div className="user-actions-right">
            <div className="user-role-badge">
              <span className="role-text-label">{user?.role?.replace("_", " ")}</span>
              <div className="avatar-circle">{avatarLetter}</div>
            </div>
            <button className="nav-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-view-content">
        <div className="nav-container-inner">
          <div className="content-fluid-wrapper">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;