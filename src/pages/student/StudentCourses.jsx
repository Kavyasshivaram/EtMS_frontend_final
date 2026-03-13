import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { 
  FaBook, FaDownload, FaClock, FaLink, FaCalendarAlt, FaExclamationCircle 
} from "react-icons/fa";
import "./StudentCourses.css";

const API_BASE = "/student";

function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Fetch courses
      const coursesRes = await api.get(`${API_BASE}/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setCourses(coursesRes.data);

      // Fetch batches
      const batchesRes = await api.get(`${API_BASE}/my-batches`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      const batchData = batchesRes.data;

      // For each batch, fetch scheduled classes
      const batchWithClasses = await Promise.all(
        batchData.map(async (batch) => {
          const classesRes = await api.get(`${API_BASE}/batch-classes`, {
            params: { batchId: batch.batchId },
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          return { ...batch, classes: classesRes.data };
        })
      );

      setBatches(batchWithClasses);

    } catch (err) {
      setError("Unable to load your courses or batches. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  };

  if (loading) return (
    <div className="loader-container">
      <div className="custom-loader"></div>
      <p>Loading your learning journey...</p>
    </div>
  );

  return (
    <div className="student-container">
      <header className="student-header">
        <div className="welcome-section">
          <h1>Welcome, {user?.name || "Student"}!</h1>
          <p>Track your enrolled courses and your batches with scheduled classes.</p>
        </div>
        <div className="student-stats">
          <div className="stat-card">
            <span className="stat-value">{courses.length}</span>
            <span className="stat-label">Active Courses</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{batches.length}</span>
            <span className="stat-label">Active Batches</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle /> {error}
        </div>
      )}

      {/* ---------------- COURSES SECTION ---------------- */}
      <section className="section-block">
        <h2>My Courses</h2>
        <div className="course-grid">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="course-card-modern">
                <div className="card-accent"></div>
                <div className="card-main-content">
                  <div className="course-type-tag">{course.duration}</div>
                  <h2 className="course-title">{course.courseName}</h2>
                  <p className="course-desc">{course.description}</p>

                  {course.batchStatus && (
                    <span className={`status-pill ${course.batchStatus.toLowerCase()}`}>
                      {course.batchStatus}
                    </span>
                  )}
                </div>
                <div className="card-actions-row">
                  {course.syllabusFileName && (
                    <button 
                      className="action-btn outline"
                      onClick={() => window.open(`${api.defaults.baseURL}/student/courses/download/${course.id}`, "_blank")}
                    >
                      <FaDownload /> Syllabus
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-enrollment">
              <FaBook className="empty-icon" />
              <h3>No Enrollments Found</h3>
              <p>You haven't been assigned to any courses yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- BATCHES SECTION ---------------- */}
      <section className="section-block">
        <h2>My Batches</h2>
        <div className="course-grid">
          {batches.length > 0 ? (
            batches.map((batch) => (
              <div key={batch.batchId} className="course-card-modern">
                <div className="card-accent batch-accent"></div>
                <div className="card-main-content">
                  <h2 className="course-title">{batch.batchName}</h2>

                  <div className="batch-classes">
                    {batch.classes && batch.classes.length > 0 ? (
                      batch.classes.map((cls) => (
                        <div key={cls.id} className="class-row">
                          <FaClock />{" "}
                          {formatDate(cls.class_date)} -{" "}
                          {formatTime(cls.start_time)} to {formatTime(cls.end_time)} ({cls.status})
                        </div>
                      ))
                    ) : (
                      <p>No scheduled classes for this batch yet.</p>
                    )}
                  </div>
                </div>

                <div className="card-actions-row">
                  <button className="action-btn primary">
                    <FaLink /> Enter Classroom
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="empty-enrollment">
              <FaCalendarAlt className="empty-icon" />
              <h3>No Batches Found</h3>
              <p>You are not assigned to any batches yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentCourses;