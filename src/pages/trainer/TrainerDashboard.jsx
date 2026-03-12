import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import {
  FaSync,
  FaUser,
  FaBook,
  FaCalendarAlt,
  FaFileAlt,
  FaClipboardCheck,
  FaTasks
} from "react-icons/fa";
import "./TrainerDashboard.css";

function TrainerDashboard() {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const trainerId = user?.id;

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalBatches: 0,
    totalStudents: 0,
    todayClasses: 0
  });

  const [schedule, setSchedule] = useState([]);

  // ✅ Pagination states
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const formatTime = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  useEffect(() => {
    if (trainerId) {
      fetchDashboard();
      fetchSchedule(0);

      const interval = setInterval(() => {
        fetchSchedule(page);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [trainerId]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get(`/teacher/dashboard/${trainerId}`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // FETCH SCHEDULE WITH PAGINATION
  // =========================
  const fetchSchedule = async (pageNo = 0) => {
  try {

    const res = await api.get(
      `/teacher/schedule/${trainerId}?page=${pageNo}&size=5`
    );

    const list = res.data.content || [];

    const now = new Date();

    const upcoming = list.filter((item) => {

      const classDate = new Date(item.class_date);

      const [endHour, endMinute] = item.end_time.split(":");
      const classEndTime = new Date(item.class_date);
      classEndTime.setHours(endHour, endMinute, 0, 0);

      // ✅ show if future date
      if (classDate > now) return true;

      // ✅ if today, check time
      if (
        classDate.toDateString() === now.toDateString() &&
        classEndTime > now
      ) {
        return true;
      }

      return false;
    });

    const sorted = upcoming.sort((a, b) => {
      const dateTimeA = new Date(`${a.class_date}T${a.start_time}`);
      const dateTimeB = new Date(`${b.class_date}T${b.start_time}`);
      return dateTimeA - dateTimeB;
    });

    setSchedule(sorted);

    setPage(res.data.page);
    setTotalPages(Math.ceil(res.data.total / res.data.size));

  } catch (err) {
    console.error("Error fetching schedule:", err);
  }
};

  return (
    <div className="trainer-dashboard-wrapper">
      <main className="dashboard-scroll-content">
        <div className="content-inner">

          <section className="stats-container">

           

            <div className="stat-card blue">
              <div className="stat-icon-box"><FaBook /></div>
              <div className="stat-data">
                <label>Total Batches</label>
                <h2>{stats.totalBatches}</h2>
              </div>
            </div>

            <div className="stat-card purple">
              <div className="stat-icon-box"><FaUser /></div>
              <div className="stat-data">
                <label>Total Students</label>
                <h2>{stats.totalStudents}</h2>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-icon-box"><FaCalendarAlt /></div>
              <div className="stat-data">
                <label>Today's Classes</label>
                <h2>{stats.todayClasses}</h2>
              </div>
            </div>

          </section>

          <div className="main-grid-layout">

            <div className="grid-col actions-col">
              <div className="glass-card">
                <div className="card-header">
                  <h3>⚡ Quick Actions</h3>
                  <FaSync className="refresh-icon-btn" onClick={fetchDashboard} />
                </div>

                <div className="action-button-grid">

                  <div className="action-tile" onClick={() => navigate("/trainer/materials")}>
                    <div className="tile-icon icon-orange"><FaFileAlt /></div>
                    <span>Materials</span>
                  </div>

                  <div className="action-tile" onClick={() => navigate("/trainer/attendance")}>
                    <div className="tile-icon icon-teal"><FaClipboardCheck /></div>
                    <span>Attendance</span>
                  </div>

                  <div className="action-tile" onClick={() => navigate("/trainer/assignments")}>
                    <div className="tile-icon icon-indigo"><FaTasks /></div>
                    <span>Tasks</span>
                  </div>

                  <div className="action-tile" onClick={() => navigate("/trainer/course")}>
                    <div className="tile-icon icon-rose"><FaBook /></div>
                    <span>Courses</span>
                  </div>

                </div>
              </div>
            </div>

            <div className="grid-col schedule-col">

              <div className="glass-card">

                <div className="card-header">
                  <h3>📅 Upcoming Classes</h3>
                </div>

                <div className="schedule-scroll">

                  {schedule.length === 0 ? (
                    <p className="empty-msg">
                      No upcoming sessions today or later
                    </p>
                  ) : (
                    schedule.map((item) => (

                      <div key={item.id + item.class_date} className="timeline-card">

                        <div className="timeline-time">
                          <span className="time-val">
                            {formatTime(item.start_time)}
                          </span>
                          <div className="time-indicator"></div>
                        </div>

                        <div className="timeline-content">

                          <div className="content-top">
                            <h4>{item.batch_name}</h4>
                           
                          </div>

                          <p>
                            {formatDate(item.class_date)} |{" "}
                            {formatTime(item.start_time)} -{" "}
                            {formatTime(item.end_time)}
                          </p>

                        </div>

                      </div>

                    ))
                  )}

                </div>

                {/* =========================
                   PAGINATION
                ========================= */}

                <div className="pagination-box">

                  <button
                    disabled={page === 0}
                    onClick={() => fetchSchedule(page - 1)}
                  >
                    Prev
                  </button>

                  <span>
                    Page {page + 1} of {totalPages}
                  </span>

                  <button
                    disabled={page + 1 === totalPages}
                    onClick={() => fetchSchedule(page + 1)}
                  >
                    Next
                  </button>

                </div>

              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default TrainerDashboard;