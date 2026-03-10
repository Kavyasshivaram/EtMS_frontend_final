import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentDashboard.css";

function StudentDashboard() {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [stats, setStats] = useState({
    totalCourses: 0,
    attendance: 0,
    pendingAssignments: 0,
    progress: 0
  });

  const notifRef = useRef();
  const profileRef = useRef();

  const token = localStorage.getItem("token");

  // ================= FETCH DASHBOARD DATA =================
  useEffect(() => {

    const fetchDashboard = async () => {
      try {

        // Inside fetchDashboard
const res = await axios.get(
  "http://localhost:8080/api/student/dashboard",
  {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true
  }
);

        setStats(res.data);

      } catch (err) {
        console.error("Dashboard load error", err);
      }
    };

    fetchDashboard();

  }, []);

  // ================= CLOSE DROPDOWN =================
  useEffect(() => {

    function handleClickOutside(e) {

      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }

      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }

    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  return (

    <div className="student-dashboard">

      {/* HEADER */}
      <div className="dashboard-header">

        <div className="header-left">
          <h1>Welcome back, {user?.name || "Student"}</h1>
          <p>Here’s what’s happening with your learning today.</p>
        </div>

        <div className="header-right">

          {/* NOTIFICATIONS */}
          <div className="notification-wrapper" ref={notifRef}>

            <div
              className="icon-button"
              onClick={() => setShowNotif(!showNotif)}
            >
              🔔
            </div>

            {showNotif && (
              <div className="dropdown">
                <h4>Notifications</h4>
                <p>📘 New Java assignment uploaded</p>
                <p>📅 Tomorrow: React class at 10AM</p>
                <p>📝 Attendance marked today</p>
              </div>
            )}

          </div>

          {/* PROFILE */}
          <div className="profile-wrapper" ref={profileRef}>

            <div
              className="profile-circle"
              onClick={() => setShowProfile(!showProfile)}
            >
              {user?.name?.charAt(0)}
            </div>

            {showProfile && (
              <div className="dropdown profile-dropdown">

                <h4>{user?.name}</h4>
                <p>{user?.email}</p>

                <hr />

                <button onClick={() => navigate("/student/profile")}>
                  👤 My Profile
                </button>

                <button onClick={() => navigate("/change-password")}>
                  🔑 Change Password
                </button>

                <button
                  className="logout-btn"
                  onClick={() => {
                    localStorage.clear();
                    navigate("/login");
                  }}
                >
                  🚪 Logout
                </button>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* ================= STATS ================= */}

      <div className="stats-grid">

        <div className="stat-card">
          <h3>{stats.totalCourses}</h3>
          <p>Total Courses</p>
        </div>

        <div className="stat-card">
          <h3>{stats.attendance}%</h3>
          <p>Attendance</p>
        </div>

        <div className="stat-card">
          <h3>{stats.pendingAssignments}</h3>
          <p>Pending Assignments</p>
        </div>

        <div className="stat-card">
          <h3>{stats.progress}%</h3>
          <p>Overall Progress</p>
        </div>

      </div>

      {/* MAIN CONTENT */}

      <div className="dashboard-main">

        <div className="card">

          <h2>Quick Actions</h2>

          <button onClick={() => navigate("/student/courses")}>
            View Courses
          </button>

          <button onClick={() => navigate("/student/attendance")}>
            View Attendance
          </button>

          <button onClick={() => navigate("/student/assignments")}>
            View Assignments
          </button>

        </div>

        <div className="card">

          <h2>Learning Progress</h2>

          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${stats.progress}%` }}
            />
          </div>

          <span>{stats.progress}% Completed</span>

        </div>

        <div className="card">

          <h2>Recent Activity</h2>

          <ul>
            <li>Assignment 1 submitted</li>
            <li>Attended Java Class</li>
            <li>Completed React Module</li>
          </ul>

        </div>

      </div>

    </div>
  );
}

export default StudentDashboard;